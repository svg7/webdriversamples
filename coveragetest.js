import * as fs from "fs";
import {createSession} from "chrome-debugging-client";

describe("Functional Coverage example", function() {
    this.timeout(880000);
    it("Get the coverage", () => {
        createSession(async (session) => {
            const api = await session.createAPIClient("localhost", 6813);
            console.dir(api);
            const tabs = await api.listTabs();
            const tab = tabs[0];
            console.log("====>");
            console.log(tab.webSocketDebuggerUrl);
            // browser.stop();
            let client = await session.openDebuggingProtocol("http://localhost:6813");
            await client.send("Profiler.enable");
            await client.send("Page.enable");
            await client.send("Profiler.startPrecisionCoverage", {callCount: true});
            await client.send("Page.navigate", {url: "https://www.microsoft.com"});
            await new Promise((resolve) => client.on("Page.loadEventFired", resolve));
            await new Promise((resolve) => setTimeout(resolve, 10000));
            let result = await client.send("Profiler.takePrecisionCoverage");
            fs.writeFileSync("coverage.json", JSON.stringify(result, null, 2));
        }). catch(err => {
            console.error(err);
        });
    });

    after(() => {
    });
});

