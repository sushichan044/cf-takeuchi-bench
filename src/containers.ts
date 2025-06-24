import { Container } from "@cloudflare/containers";

export class GoExecutor extends Container {
  override defaultPort = 8080;
  override enableInternet = false;
  override sleepAfter = "2m";

  override onError(error: unknown) {
    console.log("Container error:", error);
  }

  override onStart() {
    console.log("Container successfully started");
  }

  override onStop() {
    console.log("Container successfully shut down");
  }
}

export class NodeExecutor extends Container {
  override defaultPort = 8080;
  override enableInternet = false;
  override sleepAfter = "2m";

  override onError(error: unknown) {
    console.log("Container error:", error);
  }

  override onStart() {
    console.log("Container successfully started");
  }

  override onStop() {
    console.log("Container successfully shut down");
  }
}
