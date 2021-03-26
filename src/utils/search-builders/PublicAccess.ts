import axios from "axios";
import { Address, PipeFunction } from "../SearchBuilder";
import { JSDOM } from "jsdom";

const headers = {
  "Content-Type": "application/x-www-form-urlencoded",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
  "Accept-Encoding": "gzip, deflate, br",
  "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
  "Cookie": "JSESSIONID=kp1GyTlmjThmBVhmN9ztuB0kFbphfHKlBTm1PZBx.scnacolpubweb;"
}

export interface AddressSearchOptions {
  _csrf: string;
  type: "Application" | "Building";
  query: string;
}

export default class PublicAccess {
  
  council: string;
  address: Address;

  constructor(council: string, address: Address) {

    this.council = council;
    this.address = address;

  }

  async getCSRFToken(baseUrl: string, pipe?: PipeFunction) {
    if(pipe != null) pipe("info", "Requesting CSRF token...");
    const res = await axios.get(`${baseUrl}search.do?action=simple&searchType=Application`, { headers });
    if(res.status == 200 && res.data != null) {
      const document = new JSDOM(res.data).window.document;
      const csrfElement = <HTMLInputElement | null> document.getElementsByName("_csrf").item(0);
      if(csrfElement == null) return null;
      return csrfElement.value;
    }
  }

  async addressSearch(baseUrl: string, options: AddressSearchOptions, pipe: PipeFunction) {
    pipe("info", `Performing address search... ${options.query}`);
    const res0 = await axios.get(`${baseUrl}simpleSearchResults.do?action=firstPage`, {
      params: {
        _csrf: options._csrf,
        searchType: "Application",
        "searchCriteria.simpleSearchString": options.query,
        "searchCriteria.simpleSearch": true
      },
      headers, withCredentials: true
    });
    if(res0.status == 200 && res0.data != null) {
      const document = new JSDOM(res0.data).window.document;
      const totalElement = <HTMLSpanElement | null> document.getElementsByClassName("showing").item(0);
      if(totalElement == null) throw new Error("Could not get total results");
      const total = parseInt(totalElement.innerHTML.slice(totalElement.innerHTML.indexOf("of ") + 3));
      if(isNaN(total)) throw new Error("Could not get total results");
      
      const res1 = await axios.get(`${baseUrl}pagedSearchResults.do`, {
        params: {
          _csrf: options._csrf,
          "searchCriteria.page": 1,
          "action": "page",
          "orderBy": "DateReceived",
          "orderByDirection": "Descending",
          "searchCriteria.resultsPerPage": total
        },
        headers, withCredentials: true
      });

      if(res1.status == 200 && res1.data != null) {
        const document = new JSDOM(res1.data).window.document;
        const results = Array.from(document.getElementsByClassName("searchresult"));
        const refs = []
        for(const i in results) {
          const searchresultsElement = <HTMLLIElement> results[i];
          const metainfoElement = <HTMLParagraphElement | null> searchresultsElement.getElementsByClassName("metaInfo").item(0);
          if(metainfoElement == null) continue;
          const innerHTML = metainfoElement.innerHTML;
          refs.push(innerHTML.slice(innerHTML.indexOf("Ref. No:") + 8, innerHTML.indexOf("<span class=\"divider\">")).replace(/\n| /g, ""))
        }
        console.log(refs.join(", "))
      }
    }
  }
}