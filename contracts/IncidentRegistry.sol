// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract IncidentRegistry {
    struct Incident {
        uint256 id;
        address reporter;
        string incidentType;
        string severity;
        string description;
        int256 latE6;
        int256 lngE6;
        uint256 reportedAt;
        string sourceLanguage;
        uint256 confirmations;
    }

    uint256 public nextIncidentId;

    mapping(uint256 => Incident) private incidents;
    mapping(uint256 => mapping(address => bool)) public hasConfirmed;

    event IncidentReported(
        uint256 indexed incidentId,
        address indexed reporter,
        string incidentType,
        string severity,
        string description,
        int256 latE6,
        int256 lngE6,
        uint256 reportedAt,
        string sourceLanguage
    );

    event IncidentConfirmed(uint256 indexed incidentId, address indexed confirmer, uint256 confirmations);

    function reportIncident(
        string calldata incidentType,
        string calldata severity,
        string calldata description,
        int256 latE6,
        int256 lngE6,
        string calldata sourceLanguage
    ) external returns (uint256 incidentId) {
        require(bytes(incidentType).length > 0, "incidentType required");
        require(bytes(severity).length > 0, "severity required");
        require(bytes(description).length > 0, "description required");

        incidentId = nextIncidentId;
        nextIncidentId += 1;

        incidents[incidentId] = Incident({
            id: incidentId,
            reporter: msg.sender,
            incidentType: incidentType,
            severity: severity,
            description: description,
            latE6: latE6,
            lngE6: lngE6,
            reportedAt: block.timestamp,
            sourceLanguage: sourceLanguage,
            confirmations: 0
        });

        emit IncidentReported(
            incidentId,
            msg.sender,
            incidentType,
            severity,
            description,
            latE6,
            lngE6,
            block.timestamp,
            sourceLanguage
        );
    }

    function confirmIncident(uint256 incidentId) external {
        Incident storage incident = incidents[incidentId];
        require(incident.reportedAt != 0, "incident not found");
        require(!hasConfirmed[incidentId][msg.sender], "already confirmed");

        hasConfirmed[incidentId][msg.sender] = true;
        incident.confirmations += 1;

        emit IncidentConfirmed(incidentId, msg.sender, incident.confirmations);
    }

    function getIncident(uint256 incidentId) external view returns (Incident memory) {
        Incident memory incident = incidents[incidentId];
        require(incident.reportedAt != 0, "incident not found");
        return incident;
    }
}
