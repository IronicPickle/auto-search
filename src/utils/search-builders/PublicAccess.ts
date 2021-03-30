import axios, { AxiosInstance } from "axios";
import { Address, PipeFunction } from "../SearchBuilder";
import { JSDOM } from "jsdom";
import Parsers from "../parsers";
import { Building, Planning } from "../interfaces";
import { queryElement } from "../utils";
import { buildingFields, planningFields } from "../vars";

export interface CustomSearchOptions {
  type: "Application" | "Building";
  query: string;
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
      if(csrfElement == null) return new Error("Could not get Session ID");
      this.csrfToken = csrfElement.value;

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
    pipe("info", `Performing Search '${options.query}'`);
    
    const total = await this.initialSearch(options);
    const { rawResults, parsedResults } = await this.fullSearch(total);

    pipe("success", `Found ${rawResults.length} Results [${parsedResults.length} Matching Address]`)
    pipe("break", "Cycling Results");

    return await this.cycleResults(parsedResults, options.type, pipe);
  }

  private async initialSearch(options: CustomSearchOptions) {
    
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
    const totalElement = <HTMLSpanElement | null> document.getElementsByClassName("showing").item(0);
    if(totalElement == null) throw new Error("Could not get total results");
    const total = parseInt(totalElement.innerHTML.slice(totalElement.innerHTML.indexOf("of ") + 3));
    if(isNaN(total)) throw new Error("Could not get total results");

    return total;
    
  }

  private async fullSearch(total: number) {

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
    const rawResults = Array.from(document.getElementsByClassName("searchresult"));

    const parsedResults: { reference: string, address: string, path: string }[] = [];
    for(const i in rawResults) {
      const searchresultsElement = <HTMLLIElement> rawResults[i];
      
      const metaElement = <HTMLParagraphElement | null> searchresultsElement.getElementsByClassName("metaInfo").item(0);
      if(metaElement == null) continue;
      const reference = Parsers.removePadding(metaElement.innerHTML).replace(/(Ref\. No:)|(<span.*)/g, "");

      const addressElement = <HTMLParagraphElement | null> searchresultsElement.getElementsByClassName("address").item(0);
      if(addressElement == null) continue;
      const address = Parsers.removePadding(addressElement.innerHTML);

      const pathElement = <HTMLSpanElement | null> searchresultsElement.getElementsByTagName("a").item(0)
      if(pathElement == null) continue;
      const path = pathElement.getAttribute("href")?.replace(/.*(?=\/)/g, "");
      if(path == null) continue;
      
      if(this.checkAddress(address)) parsedResults.push({ reference, address, path });

    }

    return { rawResults, parsedResults };

  }

  private checkAddress(address: string) {

    let valid = true;
    for(const i in this.address) {
      if(this.address[i] == null) continue;
      if(!address.toLowerCase().includes(this.address[i].toLowerCase())) valid = false;
    }

    return valid;

  }

  private async cycleResults(parsedResults: { reference: string, address: string, path: string }[], type: "Application" | "Building", pipe: PipeFunction) {
    
    const results: Planning[] | Building[] = [];

    for(const i in parsedResults) {
      const parsedResult = parsedResults[i];
      pipe("info", `Requesting data for ${parsedResult.reference}`);
      const result = await this.resultSearch(parsedResult.path, type, pipe);
      if(result != null) results.push(result);
    }

    return results;

  }

  private async resultSearch(path: string, type: "Application" | "Building", pipe: PipeFunction) {

    const res = await this.axios.get(path);
    const document = new JSDOM(res.data).window.document;
    const data = (type === "Application") ? this.extractPlanningInfo(document) : this.extractBuildingInfo(document);
    return data;

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
          Parsers.removeSurroundingTags(
            tdElement0.innerHTML
          )
        );
        const value = Parsers.removePadding(
          Parsers.removeSurroundingTags(
            tdElement1.innerHTML
          )
        );
        if(name == null || value == null) return;

        planningFields.map(planningField => {
          if(name.toLowerCase() === planningField.documentId) {
            planning[planningField.actualId] = value;
          }
        });
      });

    return planning;
  }

  extractBuildingInfo(document: Document) {

    const building = <Building> {}


    return building;

  }

}