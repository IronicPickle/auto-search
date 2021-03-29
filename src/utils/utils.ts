export function queryElement(signature: string[], rootElement: Element | Document): Element | null {
  let query = signature[0];
  let element: Element | null = null;

  let index = 0;
  const regexExec = /(?:#)([0-9]+)/.exec(query);
  if(regexExec != null) {
    index = parseInt(regexExec[1]);
    query = query.slice(0, regexExec.index);
  }
  if(isNaN(index)) index = 0;

  if(query.startsWith("id:") && "getElementById" in rootElement) {
    const id = query.slice(3);
    element = rootElement.getElementById(id);
  } else if(query.startsWith("class:")) {
    const className = query.slice(6);
    element = rootElement.getElementsByClassName(className).item(index);
  } else if(query.startsWith("name:") && "getElementsByName" in rootElement) {
    const name = query.slice(5);
    element = rootElement.getElementsByName(name).item(index);
  } else {
    const tag = query;
    element = rootElement.getElementsByTagName(tag).item(index);
  }
  signature.shift();
  return (signature.length === 0 || element == null) ? element : queryElement(signature, element);
}