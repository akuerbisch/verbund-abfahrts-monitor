import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildStationBoardRequest } from "./client";
import { JOURNEY_FILTER } from "./constants";

function getReq(request: ReturnType<typeof buildStationBoardRequest>) {
    return request.svcReqL[0].req as { jnyFltrL: unknown[] };
}

describe("buildStationBoardRequest", () => {
    beforeEach(() => {
        process.env.VAO_AID = "test-aid";
    });

    afterEach(() => {
        delete process.env.VAO_AID;
    });

    it("sends only the product filter when no line filter is given", () => {
        const req = getReq(buildStationBoardRequest("Graz Hauptbahnhof", "lid-1"));
        expect(req.jnyFltrL).toEqual([...JOURNEY_FILTER]);
    });

    it("adds a LINE filter entry alongside the product filter when lines are selected", () => {
        const req = getReq(buildStationBoardRequest("Graz Hauptbahnhof", "lid-1", ["34", "58E"]));
        expect(req.jnyFltrL).toEqual([...JOURNEY_FILTER, { type: "LINE", mode: "INC", value: "34|58E" }]);
    });

    it("never mutates the shared JOURNEY_FILTER constant", () => {
        const before = JSON.stringify(JOURNEY_FILTER);
        buildStationBoardRequest("Stop A", "lid-a", ["1"]);
        buildStationBoardRequest("Stop B", "lid-b", ["2", "3"]);
        expect(JSON.stringify(JOURNEY_FILTER)).toBe(before);
    });
});
