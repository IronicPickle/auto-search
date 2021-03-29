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

  static removePadding(string: string) {
    return this.removeSpacePadding(this.removeLineBreaks(string));
  }

  static removeSpacePadding(string: string) {
    return string.replace(/ {2,}(?=[a-zA-Z0-9])|(?<=[a-zA-Z0-9]) {2,}/g, "");
  }

  static removeLineBreaks(string: string) {
    return string.replace(/\n/g, "");
  }

}