import { Building } from "../../interfaces";
import { Address, PipeFunction } from "../../SearchBuilder";
import PublicAccess from "../PublicAccess";

export default class BuildingPublicAccess extends PublicAccess {

  constructor(council: string, address: Address) {
    super(council, address);

    const baseUrl = this.baseUrls[council];
    if(baseUrl == null) throw new Error(`No URL for '${council}'`);

    this.setBaseUrl(baseUrl);

  }

  async completeSearch(strict: boolean, pipe: PipeFunction) {
    pipe("break", "Initiating Complete Building Search");
    pipe("info", "Generating Session");
    const err = await this.getCredentials();
    if(err != null) throw err;
    pipe("success", "Session Created");

    const address = this.address;

    const buildingRegs: Building[] = [];

    let houseStreet = `${address.house} ${address.street}`;
    if((address.house == null || address.house?.length === 0)) houseStreet = address.street;

    pipe("break", "Performing House and Street Search");
    const results = await this.customSearch({
      type: "BuildingControl",
      query: houseStreet,
      strict
    }, pipe);
    this.appendResults(buildingRegs, results);
    pipe("success", `Processed ${results.length} Results`);

    return buildingRegs;
  }

  private appendResults(buildingRegs: Building[], results: Building[]) {
    results.map(result => {
      if(buildingRegs.find(BuildingReg => BuildingReg.reference === result.reference) == null) {
        buildingRegs.push(result);
      }
    });
  }

  baseUrls: { [key: string]: string } = {
    stockport: "https://planning.stockport.gov.uk/PlanningData-live/",
    bolton: "https://www.planningpa.bolton.gov.uk/online-applications-17/",
    rochdale: "https://publicaccess.rochdale.gov.uk/online-applications/",
    manchester: "https://pa.manchester.gov.uk/online-applications/",
    salford: "https://publicaccess.salford.gov.uk/publicaccess/",
    trafford: "https://publicaccess.trafford.gov.uk/online-applications/",
    oldham: "https://planningpa.oldham.gov.uk/online-applications/",
    bury: "https://planning.bury.gov.uk/online-applications/",
    cheshire_west: "https://pa.cheshirewestandchester.gov.uk/online-applications/",
    chorley: "https://planning.chorley.gov.uk/online-applications/",
    west_lancs: "https://pa.westlancs.gov.uk/online-applications/",
    blackpool: "https://idoxpa.blackpool.gov.uk/online-applications/"
  }

}