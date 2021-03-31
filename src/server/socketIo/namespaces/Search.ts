import http from "http";
import { Address } from "node:cluster";
import socketIo, { Socket, Namespace } from "socket.io";
import { logger } from "../../../app";
import SearchBuilder, { LogType } from "../../../utils/SearchBuilder";

export class Search {
  nsp: Namespace

  constructor(httpServer: http.Server, socketServer: socketIo.Server) {
    this.nsp = socketServer.of("/search");
    this.start();
  }

  private validateInputs(data: { council: string, address: Address, strict: boolean }) {
    const errors =  {
      council: this.validateCouncil(data.council),
      address: this.validateAddress(data.address),
      strict: this.validateSrict(data.strict)
    }

    const errorArray: any[] = [];
    Object.values(errors).forEach(error => {
      if(typeof(error) === "object") {
        for(const i in error) {
          errorArray.push(error[i])
        }
      } else {
        errorArray.push(error);
      }
    });

    const errored = errorArray.filter(value => value != null).length > 0;

    return [ errored, errors ]

  }

  private councils = [
    "stockport"
  ]

  private validateCouncil(value: any) {
    if(!this.councils.includes(value)) return "Council is Invalid";
    return null;
  }

  private validateAddress(value: any) {
    if(typeof(value) !== "object") return "Address is Missing";
    const errors: {
      [key: string]: any,
      house: string | null,
      street: string | null,
      addressLine2: string | null,
      postCode: string | null
    } = {
      house: null,
      street: null,
      addressLine2: null,
      postCode: null
    }

    if(typeof(value.house) !== "string") { errors.house = "House is Missing"; }
    else if(value.house.length === 0) { errors.house = "House is Missing"; }

    if(typeof(value.street) !== "string") { errors.street = "Street is Missing" }
    else if(value.street.length === 0) { errors.street = "Street is Missing"; }

    if(typeof(value.addressLine2) !== "string") { errors.addressLine2 = "Region / Locality is Missing" }
    else if(value.addressLine2.length === 0) { errors.addressLine2 = "Region / Locality is Missing"; }
    
    if(typeof(value.postCode) !== "string") { errors.postCode = "Post Code is Missing" }
    else if(value.postCode.length === 0) { errors.postCode = "Post Code is Missing"; }

    return errors;
  }

  private validateSrict(value: any) {
    if(typeof(value) !== "boolean") return "Strict Mode is Missing";
    return null;
  }

  async start() {
    this.nsp.on("connection", async (socket: Socket) => {
      
      logger.http(`[Search] Socket connected: ${socket.id}`);
      socket.on("disconnect", () => {
        logger.http(`[Search] Socket disconnected: ${socket.id}`);
      });

      socket.on("completeSearch", (data: { council: string, address: Address, strict: boolean }) => {
        const [ errored, errors ] = this.validateInputs(data);
        if(errored) {
          socket.emit("errors SEARCH_DETAILS", errors);
          return logger.info(`[Search] Client 'complete search' request failed validation checks'`);
        }
        const searchBuilder = new SearchBuilder(data.council, data.address);
        if(searchBuilder.planningBuilder == null) return;

        const planningBuilder = searchBuilder.planningBuilder;
        planningBuilder.completeSearch(true, (type: LogType | "data", msg: string,  data?: any) => {
          switch(type) {
            case "data":
              logger.info(`[Search] ${msg}`);
              socket.emit("planning", data);
              break;
            case "error":
              logger.error(`[Search] ${msg}`);
              socket.emit("error", msg);
              break;
            default:
              logger.info(`[Search] ${msg}`);
              socket.emit(type, msg);
              break;

          }
        }).then((data: any) => {
          //console.log(data)
        }).catch((err: Error) => {
          logger.error(`[Search] ${err}`);
          socket.emit("error", err.message);
        });
        
      });

    });
  }

  
}