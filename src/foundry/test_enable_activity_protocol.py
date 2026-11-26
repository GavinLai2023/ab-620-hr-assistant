import unittest

from enable_activity_protocol import build_patch


class BuildPatchTest(unittest.TestCase):
    def test_adds_activity_and_keeps_existing_protocols_and_auth(self):
        agent = {"agent_endpoint": {
            "protocol_configuration": {"responses": {}, "a2a": {}},
            "authorization_schemes": [{"type": "Entra"}]}}
        self.assertEqual(build_patch(agent), {"agent_endpoint": {
            "protocol_configuration": {"responses": {}, "a2a": {}, "activity": {}},
            "authorization_schemes": [{"type": "Entra"}]}})

    def test_keeps_existing_activity_settings(self):
        agent = {"agent_endpoint": {
            "protocol_configuration": {"responses": {}, "activity": {"enable_m365_public_endpoint": True}},
            "authorization_schemes": [{"type": "Entra"}]}}
        self.assertEqual(build_patch(agent)["agent_endpoint"]["protocol_configuration"]["activity"],
                         {"enable_m365_public_endpoint": True})

    def test_defaults_when_endpoint_config_missing(self):
        self.assertEqual(build_patch({}), {"agent_endpoint": {
            "protocol_configuration": {"responses": {}, "activity": {}},
            "authorization_schemes": [{"type": "Entra"}]}})

    def test_does_not_mutate_input(self):
        agent = {"agent_endpoint": {"protocol_configuration": {"responses": {}}}}
        build_patch(agent)
        self.assertEqual(agent, {"agent_endpoint": {"protocol_configuration": {"responses": {}}}})


if __name__ == "__main__":
    unittest.main()
