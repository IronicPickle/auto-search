import { JSDOM } from "jsdom";

export default class Parsers {

  static headers(headerArray: string[]): { [key: string]: string } {

    return headerArray.map((header, i) => {
      let key = `meta${i}`;
      let value = header;
      if(header.includes("=")) {
        key = header.split("=")[0].replace(/ /g, "");
        value = header.split("=")[1].replace(/ /g, "");
      }
      return { [key]: value };
    }).reduce((result, current) => Object.assign(result, current));

  }

  static parseHTMLEntities(string: string) {
    const document = new JSDOM().window.document;
    const element = document.createElement("textarea");
    element.innerHTML = string;
    return element.value;
  }

  static removePadding(string: string) {
    return this.removeSpacePadding(
      this.removeLineBreaks(string)
    );
  }

  static removeHTMLTags(string: string) {
    return string.replace(/<.*>/g, "");
  }

  static removeSpacePadding(string: string) {
    return string.replace(/ {2,}(?=.)|(?<=.) {2,}/g, "").replace(/^ +| +$/g, "");
  }

  static removeLineBreaks(string: string) {
    return string.replace(/\n/g, "");
  }

}