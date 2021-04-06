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
      address: this.validateAddress(data.address, data.strict),
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
    "stockport", "bolton", "rochdale"
  ]

  private validateCouncil(value: any) {
    if(!this.councils.includes(value)) return "Council is Invalid";
    return null;
  }

  private validateAddress(value: any, strict: any) {
    if(typeof(value) !== "object") return "Address is Required";
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

    if(typeof(value.house) !== "string") { errors.house = "House is Required"; }
    else if(value.house.length === 0) { errors.house = "House is Required"; }

    if(typeof(value.street) !== "string") { errors.street = "Street is Required" }
    else if(value.street.length === 0) { errors.street = "Street is Required"; }

    if(strict) {
      let addressLine2Valid = true;
      if(typeof(value.addressLine2) !== "string") { addressLine2Valid = false }
      else if(value.addressLine2.length === 0) { addressLine2Valid = false }
      
      let postCodeValid = true;
      if(typeof(value.postCode) !== "string") { postCodeValid = false }
      else if(value.postCode.length === 0) { postCodeValid = false }

      if(!addressLine2Valid && !postCodeValid) {
        errors.addressLine2 = "At least a Post Code or Region / Locality is Required in Strict Mode";
        errors.postCode = "At least a Post Code or Region / Locality is Required in Strict Mode";
      }
    }

    return errors;
  }

  private validateSrict(value: any) {
    if(typeof(value) !== "boolean") return "Strict Mode is Required";
    return null;
  }

  async start() {
    this.nsp.on("connection", async (socket: Socket) => {
      
      logger.http(`[Search] Socket connected: ${socket.id}`);
      socket.on("disconnect", () => {
        logger.http(`[Search] Socket disconnected: ${socket.id}`);
      });

      socket.on("completeSearch", async (data: { council: string, address: Address, strict: boolean }) => {
        const [ errored, errors ] = this.validateInputs(data);
        if(errored) {
          socket.emit("errors SEARCH_DETAILS", errors);
          return logger.info(`[Search] Client 'complete search' request failed validation checks`);
        }
        const searchBuilder = new SearchBuilder(data.council, data.address);
        if(searchBuilder.planning == null) return;
        if(searchBuilder.building == null) return;

        const planningApps = await searchBuilder.planning.completeSearch(true, this.pipe(socket)).catch((err: Error) => {
          logger.error(`[Search] ${err}`);
          socket.emit("error", err.message);
        });

        const buildingRegs = await searchBuilder.building.completeSearch(true, this.pipe(socket)).catch((err: Error) => {
          logger.error(`[Search] ${err}`);
          socket.emit("error", err.message);
        });



        socket.emit("break", "Search Summary");
        socket.emit("info", `Planning Applications Found: ${(planningApps == null) ? "0" : planningApps.length}`);
        socket.emit("info", `Building Regulations Found: ${(buildingRegs == null) ? "0" : buildingRegs.length}`);
        
        socket.emit("planning", planningApps || []);
        socket.emit("building", buildingRegs || []);

      });

    });
  }

  pipe(socket: Socket) {
    return (type: LogType | "data", msg: string,  data?: any) => {
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
    }
  }

}