import axios, { AxiosInstance } from "axios";
import { Address, PipeFunction } from "../SearchBuilder";
import { JSDOM } from "jsdom";
import Parsers from "../parsers";
import { Building, Planning } from "../interfaces";
import { queryElement } from "../utils";
import { buildingFields, planningFields } from "../vars";
import { logger } from "../../app";
import { Options } from "body-parser";

export interface CustomSearchOptions {
  type: "Application" | "BuildingControl";
  query: string;
  strict: boolean;
}

export default class PublicAccess {
  
  council: string;
  address: Address;
  csrfToken?: string;
  sessionId?: string;
  
  private axios: AxiosInstance;

  private defaultHeaders: { [key: string]: string } = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8"
  }

  constructor(council: string, address: Address) {

    this.council = council;
    this.address = address;

    this.axios = axios.create({
      headers: this.defaultHeaders,
      withCredentials: true
    });

  }

  protected setBaseUrl(baseUrl: string) {
    this.axios.defaults.baseURL = baseUrl;
  }

  protected async getCredentials() { // This must succeed for class to be usable
    const res = await this.axios.get("search.do?action=simple&searchType=Application");
    if(res.status == 200 && res.data != null) {
      const document = new JSDOM(res.data).window.document;

      const csrfElement = <HTMLInputElement | null> document.getElementsByName("_csrf").item(0);
      this.csrfToken = csrfElement?.value || "";

      const headerArray = <string[]> res.headers["set-cookie"][0].split(";");
      const headers = Parsers.headers(headerArray);
      if(Object.keys(headers).includes("JSESSIONID")) {
        this.sessionId = headers.JSESSIONID;
        this.axios.defaults.headers.Cookie = `JSESSIONID=${headers.JSESSIONID};`;
      } else {
        return new Error("Could not get SESSION ID");
      }

    } else {
      return new Error("Could not get Credentials");
    }
  }

  protected async customSearch(options: CustomSearchOptions, pipe: PipeFunction) {
    pipe("info", `Search Query - ${options.query.toUpperCase()}`);
    
    const result = await this.simpleSearch(options);
    let results: any[] = [];
    let parsedResults: {
      reference: string;
      address: string;
      path: string;
    }[] = [];

    if(typeof(result) === "number") {
      if(result > 0) {
        results = await this.fullSimpleSearch(result);
        parsedResults = this.parseResults(results, options.strict);
      }
    } else {
      const parsedResult = this.parsePage(result, options.strict);
      if(parsedResult != null) {
        parsedResults = [ parsedResult ];
        results = [ null ];
      }
    }

    pipe("info", `Found ${results.length} Results [${parsedResults.length} Matching Address]`)
    if(result !== 0) {
      pipe("info", "Cycling Results");
      return await this.cycleResults(parsedResults, options.type, pipe);
    }
    
    return [];
  }

  parsePage(document: Document, strict: boolean) {
    const parsedResult = {
      reference: Parsers.removePadding(document.getElementsByClassName("caseNumber").item(0)?.innerHTML || ""),
      address: Parsers.parseHTMLEntities(
        Parsers.removePadding(document.getElementsByClassName("address").item(0)?.innerHTML || "")
      ),
      path: (document.getElementById("subtab_details")?.getAttribute("href") || "").replace(/.*(?=\/)/g, "")
    }

    if(this.checkAddress(parsedResult.address, strict)) return parsedResult;
    return null;
  }

  private async simpleSearch(options: CustomSearchOptions) {
    
    const res = await this.axios.get("simpleSearchResults.do?action=firstPage", {
      params: {
        _csrf: this.csrfToken,
        searchType: options.type,
        "searchCriteria.simpleSearchString": options.query,
        "searchCriteria.simpleSearch": true
      }
    });
    
    if(res.status != 200 || res.data == null) throw new Error("HTTP Request Failed");
    const document = new JSDOM(res.data).window.document;
    
    if(document.getElementById("simpleDetailsTable") != null) return document;
    
    if(document.getElementsByClassName("messagebox errors").item(0) != null) throw new Error("No Results Found - Too many Results");
    if(document.getElementsByClassName("messagebox").item(0) != null) return 0;

    let total = 9999;
    const totalElement = <HTMLSpanElement | null> document.getElementsByClassName("showing").item(0);
    if(totalElement != null) {
      let total = parseInt(totalElement.innerHTML.slice(totalElement.innerHTML.indexOf("of ") + 3));
      if(isNaN(total)) throw new Error("Could not get total results");
    }

    return total;
    
  }

  private async fullSimpleSearch(total: number) {

    const res1 = await this.axios.get("pagedSearchResults.do", {
      params: {
        _csrf: this.csrfToken,
        "searchCriteria.page": 1,
        "action": "page",
        "orderBy": "DateReceived",
        "orderByDirection": "Descending",
        "searchCriteria.resultsPerPage": total
      }
    });

    if(res1.status != 200 || res1.data == null) throw new Error("HTTP Request Failed");
    const document = new JSDOM(res1.data).window.document;
    return Array.from(document.getElementsByClassName("searchresult"));

  }

  private parseResults(results: Element[], strict: boolean) {

    const parsedResults: { reference: string, address: string, path: string }[] = [];

    for(const i in results) {
      const searchresultsElement = <HTMLLIElement> results[i];
      
      const metaElement = <HTMLParagraphElement | null> searchresultsElement.getElementsByClassName("metaInfo").item(0);
      if(metaElement == null) continue;
      const reference = Parsers.removePadding(metaElement.innerHTML).replace(/(Ref\. No:)|(<span.*)/g, "");

      const addressElement = <HTMLParagraphElement | null> searchresultsElement.getElementsByClassName("address").item(0);
      if(addressElement == null) continue;
      const address = Parsers.parseHTMLEntities(Parsers.removePadding(addressElement.innerHTML));

      const pathElement = <HTMLSpanElement | null> searchresultsElement.getElementsByTagName("a").item(0)
      if(pathElement == null) continue;
      const path = pathElement.getAttribute("href")?.replace(/.*(?=\/)/g, "");
      if(path == null) continue;
      
      if(this.checkAddress(address, strict)) parsedResults.push({ reference, address, path });

    }

    return parsedResults;
  }

  private checkAddress(address: string, strict: boolean) {

    address = address.toLowerCase().replace(/[,.]/g, "");
    const searchAddress = this.address;
    for(const i in searchAddress) {
      if(searchAddress[i] != null) searchAddress[i] = searchAddress[i].toLowerCase();
    }

    let matches = {
      houseStreet: false,
      addressLine2: false,
      postCode: false
    };

    const base = "[ \\-_&+,./]";
    const start = `(?<=${base}|^)`;
    const end = `(?=${base}|$)`;

    const houseStreetRegex = new RegExp(`${start}${searchAddress.house} ${searchAddress.street}${end}`, "g");
    const addressLine2Regex = new RegExp(`${start}${searchAddress.addressLine2}${end}`, "g");
    const postCodeRegex = new RegExp(`${start}${searchAddress.postCode}${end}`, "g");
    const postCodeNoSpaceRegex = new RegExp(`${start}${searchAddress.postCode?.replace(/ /g, "")}${end}`, "g");

    matches.houseStreet = address.match(houseStreetRegex) != null;
    if(strict) {
      if(searchAddress.addressLine2 != null) matches.addressLine2 = address.match(addressLine2Regex) != null;
      if(searchAddress.postCode != null) matches.postCode = address.match(postCodeRegex) != null || address.match(postCodeNoSpaceRegex) != null;
    }

    logger.info(`| HOUSE & STREET: ${matches.houseStreet} | REGION / LOCALITY: ${matches.addressLine2} | POSTCODE: ${matches.postCode} | - ${address}`);

    return matches.houseStreet && (!strict || matches.addressLine2 || matches.postCode);

  }

  private async cycleResults(parsedResults: { reference: string, address: string, path: string }[], type: "Application" | "BuildingControl", pipe: PipeFunction) {
    
    const results: Planning[] | Building[] = [];

    for(const i in parsedResults) {
      const parsedResult = parsedResults[i];
      pipe("info", `Requesting Data for ${parsedResult.reference}`);
      const result = await this.resultSearchFull(parsedResult.path, type);
      if(result != null) results.push(result);
    }

    return results;

  }

  private async resultSearchFull(path: string, type: "Application" | "BuildingControl") {

    const partial0 = await this.resultSearchPartial(path, "summary", type);
    const partial1 = await this.resultSearchPartial(path, "dates", type);
    const partial2 = await this.resultSearchPartial(path, "details", type);

    return { ...partial0, ...partial1, ...partial2 };

  }

  private async resultSearchPartial(path: string, tab: string, type: "Application" | "BuildingControl") {

    const res = await this.axios.get(path.replace(/(?<=activeTab=)(.*?)(?=&|$)/g, tab));
    const document = new JSDOM(res.data).window.document;
    return (type === "Application") ? this.extractPlanningInfo(document) : this.extractBuildingInfo(document);

  }

  extractPlanningInfo(document: Document) {
    const tbodyElement = queryElement(["id:simpleDetailsTable", "tbody"], document) || 
      queryElement(["id:applicationDetails", "tbody"], document) ||
      queryElement(["id:appealDetails", "tbody"], document);
    if(tbodyElement == null) return;

    const planning = <Planning> {}

    Array.from(tbodyElement.getElementsByTagName("tr"))
      .map((trElement: HTMLTableRowElement) => {
        const tdElement0 = <HTMLTableHeaderCellElement> trElement.children.item(0);
        const tdElement1 = <HTMLTableDataCellElement> trElement.children.item(1);

        const name = Parsers.removePadding(
          Parsers.removeHTMLTags(tdElement0.innerHTML)
        );
        const value = Parsers.parseHTMLEntities(
          Parsers.removePadding(
            Parsers.removeHTMLTags(tdElement1.innerHTML)
          )
        );
        if(name == null || value == null) return;

        planningFields.map(planningField => {
          if(name.toLowerCase() === planningField.documentId) {
            planning[planningField.actualId] = value;
          }
        });
      });

    if(planning.decisionIssuedDate != null)
      planning.decisionIssuedDate = new Date(planning.decisionIssuedDate).getTime();

    if(planning.decisionMadeDate != null)
      planning.decisionMadeDate = new Date(planning.decisionMadeDate).getTime();

    if(planning.applicationReceivedDate != null)
      planning.applicationReceivedDate = new Date(planning.applicationReceivedDate).getTime();

    return planning;
  }

  extractBuildingInfo(document: Document) {
    const tbodyElement = queryElement(["id:simpleDetailsTable", "tbody"], document) || 
      queryElement(["id:applicationDetails", "tbody"], document) ||
      queryElement(["id:appealDetails", "tbody"], document);
    if(tbodyElement == null) return;

    const building = <Building> {}

    Array.from(tbodyElement.getElementsByTagName("tr"))
      .map((trElement: HTMLTableRowElement) => {
        const tdElement0 = <HTMLTableHeaderCellElement> trElement.children.item(0);
        const tdElement1 = <HTMLTableDataCellElement> trElement.children.item(1);

        const name = Parsers.removePadding(
          Parsers.removeHTMLTags(tdElement0.innerHTML)
        );
        const value = Parsers.parseHTMLEntities(
          Parsers.removePadding(
            Parsers.removeHTMLTags(tdElement1.innerHTML)
          )
        );
        if(name == null || value == null) return;

        buildingFields.map(buildingField => {
          if(name.toLowerCase() === buildingField.documentId) {
            building[buildingField.actualId] = value;
          }
        });
      });

    if(building.decisionDate != null)
      building.decisionDate = new Date(building.decisionDate).getTime();

    if(building.applicationReceivedDate != null)
      building.applicationReceivedDate = new Date(building.applicationReceivedDate).getTime();

    return building;
  }

}