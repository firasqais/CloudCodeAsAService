import json
from pathlib import Path
import sys

base = Path(__file__).parent

try:
    config = json.loads((base / "infrastructure_config.json").read_text())
    resources = json.loads((base / "resources.json").read_text())
except Exception as e:
    print(f"Error reading configuration files: {e}")
    sys.exit(1)

required_keys = [
    "region", "instance_size", "number_of_instances",
    "storage_type", "network_profile", "enable_load_balancer",
    "environment_name"
]

missing = [k for k in required_keys if k not in config]
if missing:
    print("Configuration error: missing required keys ->", ", ".join(missing))
    sys.exit(1)

if config["instance_size"] not in resources["instance_sizes"]:
    print(f"Configuration error: unknown instance_size '{config['instance_size']}'")
    sys.exit(1)

if config["region"] not in resources["regions"]:
    print(f"Configuration error: unknown region '{config['region']}'")
    sys.exit(1)

if config["storage_type"] not in resources["storage_types"]:
    print(f"Configuration error: unknown storage_type '{config['storage_type']}'")
    sys.exit(1)

if config["network_profile"] not in resources["network_profiles"]:
    print(f"Configuration error: unknown network_profile '{config['network_profile']}'")
    sys.exit(1)

if not isinstance(config["number_of_instances"], int) or config["number_of_instances"] < 1:
    print("Configuration error: number_of_instances must be an integer >= 1")
    sys.exit(1)

size = resources["instance_sizes"][config["instance_size"]]
region_name = resources["regions"][config["region"]]
network = resources["network_profiles"][config["network_profile"]]

total_estimated_cost = size["monthly_cost_estimate"] * config["number_of_instances"]
load_balancer_needed = config["number_of_instances"] > 1 or config["enable_load_balancer"]

print("=" * 64)
print("SIMULATED INFRASTRUCTURE DEPLOYMENT")
print("=" * 64)
print(f"Environment: {config['environment_name']}")
print(f"Region: {config['region']} ({region_name})")
print(f"Instance size: {config['instance_size']} | vCPU: {size['cpu']} | RAM: {size['memory_gb']} GB")
print(f"Number of application instances: {config['number_of_instances']}")
print(f"Storage type: {config['storage_type']} — {resources['storage_types'][config['storage_type']]}")
print(f"Network profile: {config['network_profile']} — {network['description']}")
print(f"Public access: {'Yes' if network['public_access'] else 'No'}")
print(f"Open ports: {network['open_ports'] if network['open_ports'] else 'None'}")
print("=" * 64)
print("Provisioning timeline")
print("- Creating network resources")
print("- Provisioning compute instances")
print("- Attaching storage")
print("- Applying network profile")
if load_balancer_needed:
    print("- Enabling load balancing for replicated application instances")
else:
    print("- Load balancer not required for single-instance deployment")
print("- Validating deployment state")
print("=" * 64)
print("Scaling behaviour")
if config["number_of_instances"] == 1:
    print("- Single instance deployment")
    print("- Limited fault tolerance")
    print("- Suitable for development or low-traffic scenarios")
else:
    print(f"- Replicated deployment across {config['number_of_instances']} instances")
    print("- Improved high availability")
    print("- Supports traffic distribution across instances")
    print("- More suitable for growing or production workloads")
print("=" * 64)
print("Repeatability note")
print("- Re-running this script with the same configuration should produce the same architecture outcome.")
print("- Changing variables changes the simulated infrastructure in a predictable way.")
print("=" * 64)
print("Estimated monthly compute cost: $" + str(total_estimated_cost))
print("=" * 64)
