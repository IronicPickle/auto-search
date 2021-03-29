import axios, { AxiosInstance } from "axios";
import { Address, PipeFunction } from "../SearchBuilder";
import { JSDOM } from "jsdom";
import Parsers from "../parsers";

export interface AddressSearchOptions {
  type: "Application" | "Building";
  query: string;
}

export default class PublicAccess {
  
  council: string;
  address: Address;
  axios: AxiosInstance;
  csrfToken?: string;
  sessionId?: string;

  headers: { [key: string]: string } = {
    "Content-Type": "application/x-www-form-urlencoded",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8"
  }

  constructor(council: string, address: Address) {

    this.council = council;
    this.address = address;

    this.axios = axios.create({});

  }

  async getCredentials(baseUrl: string) {
    const res = await this.axios.get(`${baseUrl}search.do?action=simple&searchType=Application`, { headers: this.headers });
    if(res.status == 200 && res.data != null) {
      const document = new JSDOM(res.data).window.document;

      const csrfElement = <HTMLInputElement | null> document.getElementsByName("_csrf").item(0);
      if(csrfElement == null) return new Error("Could not get Session ID");
      this.csrfToken = csrfElement.value;

      const headerArray = <string[]> res.headers["set-cookie"][0].split(";");
      const headers = Parsers.headers(headerArray);
      if(Object.keys(headers).includes("JSESSIONID")) {
        this.sessionId = headers.JSESSIONID;
        this.headers.Cookie = `JSESSIONID=${headers.JSESSIONID};`;
      } else {
        return new Error("Could not get SESSION ID");
      }

    } else {
      return new Error("Could not get Credentials");
    }
  }

  async addressSearch(baseUrl: string, options: AddressSearchOptions, pipe: PipeFunction) {
    pipe("info", `Performing Address Search... ${options.query}`);
    const res0 = await this.axios.get(`${baseUrl}simpleSearchResults.do?action=firstPage`, {
      params: {
        _csrf: this.csrfToken,
        searchType: "Application",
        "searchCriteria.simpleSearchString": options.query,
        "searchCriteria.simpleSearch": true
      },
      headers: this.headers, withCredentials: true
    });
    if(res0.status == 200 && res0.data != null) {
      const document = new JSDOM(res0.data).window.document;
      const totalElement = <HTMLSpanElement | null> document.getElementsByClassName("showing").item(0);
      if(totalElement == null) throw new Error("Could not get total results");
      const total = parseInt(totalElement.innerHTML.slice(totalElement.innerHTML.indexOf("of ") + 3));
      if(isNaN(total)) throw new Error("Could not get total results");
      
      const res1 = await this.axios.get(`${baseUrl}pagedSearchResults.do`, {
        params: {
          _csrf: this.csrfToken,
          "searchCriteria.page": 1,
          "action": "page",
          "orderBy": "DateReceived",
          "orderByDirection": "Descending",
          "searchCriteria.resultsPerPage": total
        },
        headers: this.headers, withCredentials: true
      });

      if(res1.status == 200 && res1.data != null) {
        const document = new JSDOM(res1.data).window.document;
        const results = Array.from(document.getElementsByClassName("searchresult"));
        pipe("info", `Found ${results.length} Results`)

        const parsedResults = [];
        for(const i in results) {
          const searchresultsElement = <HTMLLIElement> results[i];

          const addressElement = <HTMLParagraphElement | null> searchresultsElement.getElementsByClassName("address").item(0);
          if(addressElement == null) continue;
          const address = Parsers.removePadding(addressElement.innerHTML);

          const urlElement = <HTMLSpanElement | null> searchresultsElement.getElementsByTagName("a").item(0)
          if(urlElement == null) continue;
          const url = urlElement.getAttribute("href");
          
          if(this.checkAddress(address)) parsedResults.push({ address, url });

        }
        pipe("info", `Found ${parsedResults.length} Matching Results`);
      }
    }
  }

  checkAddress(address: string) {

    let valid = true;
    for(const i in this.address) {
      if(this.address[i] == null) continue;
      if(!address.toLowerCase().includes(this.address[i].toLowerCase())) valid = false;
    }

    return valid;

  }
}