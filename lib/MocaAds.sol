// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title MocaAds
 * @dev Smart contract for privacy-preserving advertising platform using native MOCA
 * @notice Handles campaign creation and reward distribution with self-claiming
 */
contract MocaAds is Ownable, ReentrancyGuard, Pausable {
    // Protocol fee wallet
    address public protocolWallet;

    // Operator for batch operations (backend)
    address public operator;

    // Revenue distribution percentages (basis points: 10000 = 100%)
    uint256 public constant USER_SHARE = 6000; // 60%
    uint256 public constant WEBSITE_SHARE = 2500; // 25%
    uint256 public constant PROTOCOL_SHARE = 1500; // 15%

    // Minimum campaign budget (0.01 MOCA)
    uint256 public minCampaignBudget = 0.01 ether;

    // Fixed cost per view (0.001 MOCA)
    uint256 public fixedCostPerView = 0.001 ether;

    // Campaign counter
    uint256 public campaignCounter;

    // Credential types enum for targeting
    enum CredentialType {
        AGE_18_PLUS, // User is 18+
        EU_RESIDENT, // User is EU resident
        INCOME_LOW, // Low income bracket
        INCOME_MID, // Mid income bracket
        INCOME_HIGH, // High income bracket
        UNIVERSITY_GRAD, // University graduate
        FREQUENT_TRAVELER // Travels frequently
    }

    // Structs
    struct Campaign {
        uint256 id;
        address advertiser;
        string name;
        uint256 budget;
        uint256 spent;
        uint256 startTime;
        uint256 endTime;
        bool active;
        CredentialType[] targetCredentials;
        string adContentHash; // IPFS hash of ad content
        uint256 totalViews;
    }

    struct Website {
        address owner;
        string domain;
        uint256 totalEarnings;
        uint256 totalViews;
        uint256 claimableRewards;
    }

    struct UserStats {
        uint256 totalEarnings;
        uint256 totalViews;
        uint256 claimableRewards;
    }

    struct BatchReward {
        address user;
        string website;
        uint256 views;
        uint256 campaignId;
    }

    // Mappings
    mapping(uint256 => Campaign) public campaigns;
    mapping(string => Website) public websites; // domain => Website
    mapping(address => UserStats) public users;

    // Protocol claimable rewards
    uint256 public protocolClaimableRewards;

    // Arrays for enumeration
    uint256[] public activeCampaignIds;
    string[] public registeredDomains;

    // Events
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed advertiser,
        string name,
        uint256 budget,
        CredentialType[] targetCredentials
    );

    event CampaignFunded(uint256 indexed campaignId, uint256 amount);

    event WebsiteRegistered(string domain, address owner);

    event BatchRewardsUpdated(
        uint256 totalUsers,
        uint256 totalUserRewards,
        uint256 totalWebsiteRewards,
        uint256 totalProtocolRewards
    );

    event UserRewardsClaimed(address indexed user, uint256 amount);
    event WebsiteRewardsClaimed(
        string indexed domain,
        address indexed owner,
        uint256 amount
    );
    event ProtocolRewardsClaimed(address indexed wallet, uint256 amount);

    // Modifiers
    modifier onlyOperator() {
        require(msg.sender == operator, "Only operator can call");
        _;
    }

    modifier validCampaign(uint256 _campaignId) {
        require(
            _campaignId > 0 && _campaignId <= campaignCounter,
            "Invalid campaign ID"
        );
        require(campaigns[_campaignId].active, "Campaign not active");
        require(
            block.timestamp >= campaigns[_campaignId].startTime,
            "Campaign not started"
        );
        require(
            block.timestamp <= campaigns[_campaignId].endTime,
            "Campaign ended"
        );
        _;
    }

    constructor(
        address _protocolWallet,
        address _operator
    ) Ownable(msg.sender) {
        protocolWallet = _protocolWallet;
        operator = _operator;
    }

    /**
     * @dev Create new advertising campaign with native MOCA
     */
    function createCampaign(
        string memory _name,
        uint256 _duration, // in seconds
        CredentialType[] memory _targetCredentials,
        string memory _adContentHash
    ) external payable nonReentrant {
        require(msg.value >= minCampaignBudget, "Budget too low");
        require(_duration > 0, "Duration must be positive");
        require(bytes(_name).length > 0, "Campaign name required");
        require(bytes(_adContentHash).length > 0, "Ad content hash required");

        campaignCounter++;

        Campaign storage campaign = campaigns[campaignCounter];
        campaign.id = campaignCounter;
        campaign.advertiser = msg.sender;
        campaign.name = _name;
        campaign.budget = msg.value;
        campaign.spent = 0;
        campaign.startTime = block.timestamp;
        campaign.endTime = block.timestamp + _duration;
        campaign.active = true;
        campaign.targetCredentials = _targetCredentials;
        campaign.adContentHash = _adContentHash;
        campaign.totalViews = 0;

        activeCampaignIds.push(campaignCounter);

        emit CampaignCreated(
            campaignCounter,
            msg.sender,
            _name,
            msg.value,
            _targetCredentials
        );
    }

    /**
     * @dev Fund existing campaign with additional budget
     */
    function fundCampaign(uint256 _campaignId) external payable {
        require(
            campaigns[_campaignId].advertiser == msg.sender,
            "Not campaign owner"
        );
        require(msg.value > 0, "Amount must be positive");

        campaigns[_campaignId].budget += msg.value;

        emit CampaignFunded(_campaignId, msg.value);
    }

    /**
     * @dev Register website (automatically verified since off-chain validation done)
     */
    function registerWebsite(string memory _domain) external {
        require(bytes(_domain).length > 0, "Domain required");
        require(
            websites[_domain].owner == address(0),
            "Website already registered"
        );

        websites[_domain] = Website({
            owner: msg.sender,
            domain: _domain,
            totalEarnings: 0,
            totalViews: 0,
            claimableRewards: 0
        });

        registeredDomains.push(_domain);

        emit WebsiteRegistered(_domain, msg.sender);
    }

    /**
     * @dev Batch update claimable rewards for users and websites (called by operator/backend)
     * @param _rewards Array of BatchReward structs containing user, website, views, campaignId
     */
    function batchUpdateRewards(
        BatchReward[] memory _rewards
    ) external onlyOperator {
        require(_rewards.length > 0, "No rewards to update");

        uint256 totalUserRewards = 0;
        uint256 totalWebsiteRewards = 0;
        uint256 totalProtocolRewards = 0;

        for (uint i = 0; i < _rewards.length; i++) {
            BatchReward memory reward = _rewards[i];

            // Validate campaign and website
            require(campaigns[reward.campaignId].active, "Campaign not active");
            require(
                websites[reward.website].owner != address(0),
                "Website not registered"
            );
            require(reward.views > 0, "Views must be positive");

            Campaign storage campaign = campaigns[reward.campaignId];
            uint256 totalCost = reward.views * fixedCostPerView;

            // Check if campaign has enough budget
            require(
                campaign.spent + totalCost <= campaign.budget,
                "Campaign budget exceeded"
            );

            // Calculate reward distribution
            uint256 userReward = (totalCost * USER_SHARE) / 10000;
            uint256 websiteReward = (totalCost * WEBSITE_SHARE) / 10000;
            uint256 protocolReward = (totalCost * PROTOCOL_SHARE) / 10000;

            // Update campaign stats
            campaign.spent += totalCost;
            campaign.totalViews += reward.views;

            // Update user claimable rewards
            users[reward.user].totalEarnings += userReward;
            users[reward.user].totalViews += reward.views;
            users[reward.user].claimableRewards += userReward;

            // Update website claimable rewards
            websites[reward.website].totalEarnings += websiteReward;
            websites[reward.website].totalViews += reward.views;
            websites[reward.website].claimableRewards += websiteReward;

            // Update protocol claimable rewards
            protocolClaimableRewards += protocolReward;

            // Accumulate totals for event
            totalUserRewards += userReward;
            totalWebsiteRewards += websiteReward;
            totalProtocolRewards += protocolReward;

            // Check if campaign is exhausted
            if (campaign.spent >= campaign.budget) {
                campaign.active = false;
                _removeFromActiveCampaigns(reward.campaignId);
            }
        }

        emit BatchRewardsUpdated(
            _rewards.length,
            totalUserRewards,
            totalWebsiteRewards,
            totalProtocolRewards
        );
    }

    /**
     * @dev User claims their accumulated rewards
     */
    function claimUserRewards() external nonReentrant {
        uint256 claimable = users[msg.sender].claimableRewards;
        require(claimable > 0, "No rewards to claim");
        require(
            address(this).balance >= claimable,
            "Insufficient contract balance"
        );

        users[msg.sender].claimableRewards = 0;

        (bool success, ) = payable(msg.sender).call{value: claimable}("");
        require(success, "Reward transfer failed");

        emit UserRewardsClaimed(msg.sender, claimable);
    }

    /**
     * @dev Website owner claims their accumulated rewards
     */
    function claimWebsiteRewards(string memory _domain) external nonReentrant {
        require(websites[_domain].owner == msg.sender, "Not website owner");

        uint256 claimable = websites[_domain].claimableRewards;
        require(claimable > 0, "No rewards to claim");
        require(
            address(this).balance >= claimable,
            "Insufficient contract balance"
        );

        websites[_domain].claimableRewards = 0;

        (bool success, ) = payable(msg.sender).call{value: claimable}("");
        require(success, "Reward transfer failed");

        emit WebsiteRewardsClaimed(_domain, msg.sender, claimable);
    }

    /**
     * @dev Protocol wallet claims accumulated protocol rewards
     */
    function claimProtocolRewards() external nonReentrant {
        require(msg.sender == protocolWallet, "Only protocol wallet can claim");

        uint256 claimable = protocolClaimableRewards;
        require(claimable > 0, "No rewards to claim");
        require(
            address(this).balance >= claimable,
            "Insufficient contract balance"
        );

        protocolClaimableRewards = 0;

        (bool success, ) = payable(protocolWallet).call{value: claimable}("");
        require(success, "Protocol reward transfer failed");

        emit ProtocolRewardsClaimed(protocolWallet, claimable);
    }

    /**
     * @dev Remove campaign from active list
     */
    function _removeFromActiveCampaigns(uint256 _campaignId) internal {
        for (uint i = 0; i < activeCampaignIds.length; i++) {
            if (activeCampaignIds[i] == _campaignId) {
                activeCampaignIds[i] = activeCampaignIds[
                    activeCampaignIds.length - 1
                ];
                activeCampaignIds.pop();
                break;
            }
        }
    }

    /**
     * @dev Withdraw unused campaign budget (after campaign ends)
     */
    function withdrawCampaignBudget(uint256 _campaignId) external nonReentrant {
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.advertiser == msg.sender, "Not campaign owner");
        require(block.timestamp > campaign.endTime, "Campaign still active");

        uint256 remaining = campaign.budget - campaign.spent;
        require(remaining > 0, "No budget to withdraw");

        campaign.budget = campaign.spent; // Update to prevent re-withdrawal

        (bool success, ) = payable(msg.sender).call{value: remaining}("");
        require(success, "Withdrawal failed");
    }

    // View functions
    function getCampaign(
        uint256 _campaignId
    ) external view returns (Campaign memory) {
        return campaigns[_campaignId];
    }

    function getActiveCampaigns() external view returns (uint256[] memory) {
        return activeCampaignIds;
    }

    function getRegisteredDomains() external view returns (string[] memory) {
        return registeredDomains;
    }

    function getCampaignTargeting(
        uint256 _campaignId
    ) external view returns (CredentialType[] memory) {
        return campaigns[_campaignId].targetCredentials;
    }

    function getUserStats(
        address _user
    ) external view returns (UserStats memory) {
        return users[_user];
    }

    function getUserClaimableRewards(
        address _user
    ) external view returns (uint256) {
        return users[_user].claimableRewards;
    }

    function getWebsite(
        string memory _domain
    ) external view returns (Website memory) {
        return websites[_domain];
    }

    function getWebsiteClaimableRewards(
        string memory _domain
    ) external view returns (uint256) {
        return websites[_domain].claimableRewards;
    }

    function getProtocolClaimableRewards() external view returns (uint256) {
        return protocolClaimableRewards;
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Get claimable rewards for a website owner (by checking all their websites)
     */
    function getOwnerTotalClaimableRewards(
        address _owner
    ) external view returns (uint256) {
        uint256 total = 0;
        for (uint i = 0; i < registeredDomains.length; i++) {
            string memory domain = registeredDomains[i];
            if (websites[domain].owner == _owner) {
                total += websites[domain].claimableRewards;
            }
        }
        return total;
    }

    /**
     * @dev Get all websites owned by an address
     */
    function getOwnerWebsites(
        address _owner
    ) external view returns (string[] memory) {
        string[] memory temp = new string[](registeredDomains.length);
        uint256 count = 0;

        for (uint i = 0; i < registeredDomains.length; i++) {
            string memory domain = registeredDomains[i];
            if (websites[domain].owner == _owner) {
                temp[count] = domain;
                count++;
            }
        }

        // Create properly sized array
        string[] memory ownerDomains = new string[](count);
        for (uint i = 0; i < count; i++) {
            ownerDomains[i] = temp[i];
        }

        return ownerDomains;
    }

    // Admin functions
    function updateProtocolWallet(address _newWallet) external onlyOwner {
        protocolWallet = _newWallet;
    }

    function updateOperator(address _newOperator) external onlyOwner {
        operator = _newOperator;
    }

    function updateMinCampaignBudget(uint256 _newMinBudget) external onlyOwner {
        minCampaignBudget = _newMinBudget;
    }

    function updateFixedCostPerView(uint256 _newCost) external onlyOwner {
        fixedCostPerView = _newCost;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Emergency functions
    function emergencyWithdraw() external onlyOwner whenPaused {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Emergency withdrawal failed");
    }

    // Receive function to accept MOCA
    receive() external payable {}
}
