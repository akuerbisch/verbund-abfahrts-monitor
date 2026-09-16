import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

function stationBoardResponse(jnyL: unknown[], prodL: unknown[] = [{ nameS: "34" }]) {
    return {
        svcResL: [{ id: "1|7|", err: "OK", res: { common: { prodL }, jnyL } }],
    };
}

function departureJny(line: string, prodL: { nameS: string }[]) {
    const prodX = prodL.findIndex((prod) => prod.nameS === line);
    return { prodX, dirTxt: "City Center", date: "20260722", stbStop: { dTimeS: "203000" } };
}

const callVaoGate = vi.fn();

vi.mock("@/lib/vao/client", async () => {
    const actual = await vi.importActual<typeof import("@/lib/vao/client")>("@/lib/vao/client");
    return { ...actual, callVaoGate: (...args: unknown[]) => callVaoGate(...args) };
});

describe("POST /api/departures", () => {
    beforeEach(() => {
        process.env.VAO_AID = "test-aid";
        callVaoGate.mockReset();
    });

    afterEach(() => {
        delete process.env.VAO_AID;
    });

    function requestFor(body: Record<string, unknown>) {
        return new Request("http://localhost/api/departures", { method: "POST", body: JSON.stringify(body) });
    }

    it("returns departures unchanged when no line filter is given", async () => {
        const prodL = [{ nameS: "34" }];
        callVaoGate.mockResolvedValueOnce(stationBoardResponse([departureJny("34", prodL)], prodL));

        const { POST } = await import("./route");
        const response = await POST(requestFor({ name: "Stop", lid: "lid-1" }));
        const data = await response.json();

        expect(callVaoGate).toHaveBeenCalledTimes(1);
        expect(data.departures).toHaveLength(1);
        expect(data.departures[0].line).toBe("34");
    });

    it("retries unfiltered when a line-filtered request comes back with zero departures", async () => {
        const prodL = [{ nameS: "34" }, { nameS: "58E" }];
        callVaoGate
            .mockResolvedValueOnce(stationBoardResponse([], prodL)) // filtered attempt: silently empty
            .mockResolvedValueOnce(stationBoardResponse([departureJny("34", prodL), departureJny("58E", prodL)], prodL)); // unfiltered retry

        const { POST } = await import("./route");
        const response = await POST(requestFor({ name: "Stop", lid: "lid-1", lineFilter: ["34", "58E"] }));
        const data = await response.json();

        expect(callVaoGate).toHaveBeenCalledTimes(2);
        const secondCallReq = (callVaoGate.mock.calls[1][0] as { svcReqL: [{ req: { jnyFltrL: unknown[] } }] }).svcReqL[0].req;
        expect(secondCallReq.jnyFltrL.some((entry) => (entry as { type?: string }).type === "LINE")).toBe(false);
        expect(data.departures).toHaveLength(2);
    });

    it("does not retry when a line-filtered request already returns departures", async () => {
        const prodL = [{ nameS: "34" }];
        callVaoGate.mockResolvedValueOnce(stationBoardResponse([departureJny("34", prodL)], prodL));

        const { POST } = await import("./route");
        const response = await POST(requestFor({ name: "Stop", lid: "lid-1", lineFilter: ["34"] }));
        await response.json();

        expect(callVaoGate).toHaveBeenCalledTimes(1);
    });

    it("still retries unfiltered when the filtered request throws", async () => {
        const { VaoUpstreamError } = await import("@/lib/vao/client");
        const prodL = [{ nameS: "34" }];
        callVaoGate
            .mockRejectedValueOnce(new VaoUpstreamError("rejected", 400))
            .mockResolvedValueOnce(stationBoardResponse([departureJny("34", prodL)], prodL));

        const { POST } = await import("./route");
        const response = await POST(requestFor({ name: "Stop", lid: "lid-1", lineFilter: ["34"] }));
        const data = await response.json();

        expect(callVaoGate).toHaveBeenCalledTimes(2);
        expect(data.departures).toHaveLength(1);
    });
});
