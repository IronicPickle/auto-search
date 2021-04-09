import http from "http";
import socketIo, { Socket, Namespace } from "socket.io";
import { logger } from "../../../app";
import SearchBuilder, { LogType } from "../../../utils/SearchBuilder";

export class Search {
  nsp: Namespace

  constructor(httpServer: http.Server, socketServer: socketIo.Server) {
    this.nsp = socketServer.of("/search");
    this.start();
  }

  private completeSearchValidate(body: any) {
    const errors =  {
      council: this.validateCouncil(body.council),
      address: this.validateAddress(body.address, body.strict),
      strict: this.validateSrict(body.strict)
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
    "stockport",
    "bolton",
    "rochdale",
    "manchester",
    "tameside",
    "salford",
    "trafford",
    "wigan",
    "oldham",
    "bury",
    "cheshire_west",
    "chorley",
    "west_lancs",
    "blackpool"
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

    if(typeof(value.house) !== "string" && value.house != null) { errors.house = "House is Required"; }

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

      interface CompleteSearchParams {
        council: string; //~ REQUIRED & MUST MATCH SUPPORTED COUNCIL
        address: {
          house?: string; //~ OPTIONAL - WILL DEFAULT TO AN EMPTY STRING
          street: string; //~ REQUIRED
          addressLine2?: string; //~ OPTIONAL - REQUIRED IF data.strict === true
          postCode?: string; //~ OPTIONAL - REQUIRES IF data.strict === true
        },
        strict: boolean; // ~ REQUIRED;
      }

      socket.on("completeSearch", async (body?: any) => {

        socket.emit("stage", "validation");

        if(body == null) {
          socket.emit("error BODY_ERROR", "Search Details are Missing");
          return logger.info(`[Search] Client 'complete search' requested with no body`);
        }
        
        const [ errored, errors ] = this.completeSearchValidate(body);
        if(errored) {
          socket.emit("error SEARCH_DETAILS", errors);
          return logger.info(`[Search] Client 'complete search' request failed validation checks`);
        }

        const data = <CompleteSearchParams> body;
        socket.emit("log", "success", "Details Validated");
        
        socket.emit("stage", "started");
        const searchBuilder = new SearchBuilder(data.council, data.address);
        let planningApps = [];
        let buildingRegs = [];

        if(searchBuilder.planning != null) {
          planningApps = await searchBuilder.planning.completeSearch(data.strict, this.pipe(socket)).catch((err: Error) => {
            logger.error(`[Search] ${err}`);
            socket.emit("log", "error", err.message);
          });
        } else {
          socket.emit("break", "Cannot Perform Planning Search");
          socket.emit("log", "warning", `Planning Searches are not supported for ${data.council.toUpperCase()}`);
        }

        if(searchBuilder.building != null) {
          buildingRegs = await searchBuilder.building.completeSearch(data.strict, this.pipe(socket)).catch((err: Error) => {
            logger.error(`[Search] ${err}`);
            socket.emit("log", "error", err.message);
          });
        } else {
          socket.emit("break", "Cannot Perform Building Search");
          socket.emit("log", "warning", `Building Searches are not supported for ${data.council.toUpperCase()}`);
        }

        socket.emit("break", "Search Summary");
        if(planningApps != null) {
          socket.emit("log", "info", `Planning Applications Found: ${planningApps.length}`);
          socket.emit("planning", planningApps);
        } if(buildingRegs != null) {
          socket.emit("log", "info", `Building Regulations Found: ${buildingRegs.length}`);
          socket.emit("building", buildingRegs);
        }
        
        socket.emit("log", "success", "Search Finished");
        socket.emit("stage", "finished");

      });

    });
  }

  pipe(socket: Socket) {
    return (type: LogType, msg: string) => {
      switch(type) {
        case "break":
          logger.error(`[Search] ${msg}`);
          socket.emit("break", msg);
          break;
        default:
          logger.info(`[Search] ${msg}`);
          socket.emit("log", type, msg);
          break;
      }
    }
  }

}