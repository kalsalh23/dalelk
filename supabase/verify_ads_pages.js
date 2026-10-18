// تحقق حي: صفحة الإعلانات + صفحة التفاصيل + بطاقة الهيرو تفتح التفاصيل
const browserPluginRoot =
  process.env.ZCODE_PLUGIN_ROOT ?? process.env.CLAUDE_PLUGIN_ROOT;
const { join } = await import("node:path");
const { pathToFileURL } = await import("node:url");
const { setupBrowserRuntime } = await import(
  pathToFileURL(join(browserPluginRoot, "scripts", "browser-client.mjs")).href
);
await setupBrowserRuntime({ globals: globalThis });

const browser = await agent.browsers.getForUrl("https://dalil-altaybeh.vercel.app/");
const tabsList = await browser.tabs.list();
const tabInfo = tabsList.find(t => t.url?.includes("dalil-altaybeh"));
const tab = tabInfo ? await browser.tabs.get(tabInfo.id) : await browser.tabs.new();
await tab.setViewportSize({ width: 412, height: 900 });

// 1) صفحة الإعلانات
await tab.goto("https://dalil-altaybeh.vercel.app/ads");
await tab.playwright.waitForLoadState({ state: "domcontentloaded" });
await tab.playwright.waitForTimeout(2500);
nodeRepl.emitImage(await tab.screenshot());
"ads page";