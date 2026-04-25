// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../contracts/IncidentRegistry.sol";

contract DeployIncidentRegistryScript is Script {
    function run() external {
        vm.startBroadcast();
        IncidentRegistry registry = new IncidentRegistry();
        console.log("IncidentRegistry deployed at:", address(registry));
        vm.stopBroadcast();
    }
}
