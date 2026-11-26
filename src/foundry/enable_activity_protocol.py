"""Enable the Activity protocol on a Foundry agent so Copilot Studio can call it.

The Foundry portal has no switch for this, so it is done with the agent REST API:
GET the agent, merge "activity" into its protocols, PATCH it back.
PATCH replaces protocol_configuration and authorization_schemes, so the existing
values are kept. The access token is only held in memory and never printed.

Usage:
  python enable_activity_protocol.py --endpoint https://<account>.services.ai.azure.com/api/projects/<project> --agent <agent-name>
"""
import argparse
import copy
import json
import sys
import urllib.error
import urllib.request

API_VERSION = "v1"
TOKEN_SCOPE = "https://ai.azure.com/.default"


def build_patch(agent: dict) -> dict:
    endpoint = copy.deepcopy(agent.get("agent_endpoint") or {})
    protocols = endpoint.get("protocol_configuration") or {"responses": {}}
    protocols.setdefault("activity", {})
    schemes = endpoint.get("authorization_schemes") or [{"type": "Entra"}]
    return {"agent_endpoint": {
        "protocol_configuration": protocols,
        "authorization_schemes": schemes}}


def call(method: str, url: str, token: str, body: dict | None = None) -> dict:
    headers = {"Authorization": f"Bearer {token}"}
    data = None
    if body is not None:
        headers["Content-Type"] = "application/merge-patch+json"
        data = json.dumps(body).encode()
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as res:
            return json.loads(res.read())
    except urllib.error.HTTPError as e:
        print(f"{method} failed: HTTP {e.code}")
        print(e.read().decode(errors="replace"))
        sys.exit(1)


def protocol_names(agent: dict) -> list:
    return sorted(((agent.get("agent_endpoint") or {}).get("protocol_configuration") or {}).keys())


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--endpoint", required=True, help="Foundry project endpoint")
    parser.add_argument("--agent", required=True, help="Foundry agent name")
    args = parser.parse_args()

    from azure.identity import InteractiveBrowserCredential
    token = InteractiveBrowserCredential().get_token(TOKEN_SCOPE).token

    url = f"{args.endpoint.rstrip('/')}/agents/{args.agent}?api-version={API_VERSION}"
    agent = call("GET", url, token)
    print("Protocols before:", protocol_names(agent))
    if "activity" in protocol_names(agent):
        print("Activity protocol is already enabled.")
        return

    call("PATCH", url, token, build_patch(agent))
    print("Protocols after:", protocol_names(call("GET", url, token)))


if __name__ == "__main__":
    main()
