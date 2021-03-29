export interface Planning {
  [key: string]: any;
  reference?: string;
  descripton?: string;
  address?: string;
  status?: string;
  decision?: string;
  decisionIssuedDate?: number | string;
  decisionMadeDate?: number | string;
  applicationReceivedDate?: number | string;
}

export interface Building {
  [key: string]: any;
  reference?: string;
  descripton?: string;
  address?: string;
  extra?: string;
  extraDate?: number | string;
  decision?: string;
  decisionDate?: number | string;
  applicationReceivedDate?: number | string;
}