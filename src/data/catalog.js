export const CURRENT_SITE_VERSION = "v1.2";

export const catalog = [
    {
        id: "games",
        title: "Games",
        description: "The best mods, scripts, and clients for your favorite sandbox games.",
        subsections: [
            {
                title: "Minecraft",
                items: [
                    {
                        id: "mc_modpack_01",
                        name: "NexusClient1.21",
                        version: "V1.0",
                        type: "File",
                        description: "A high-fidelity modpack completely overhauling textures and lighting.",
                        longDescription: "Experience Minecraft like never before.",
                        author: "Zentry Team",
                        downloads: 0,
                        icon: "ph-cube",
                        tags: ["Minecraft", "Modpacks"],
                        downloadLink: "downloads/NexusClient1.21.zip",
                        size: "149 KB",
                        isNew: true,
                        requirements: {
                            os: "Any",
                            processor: "N/A",
                            ram: "16 GB",
                            graphics: "N/A"
                        }
                    }
                ]
            },
            {
                title: "Roblox",
                items: [
                    {
                        id: "Bloxstrap",
                        name: "Bloxstrap",
                        version: "v2.10",
                        type: "BootLoad",
                        description: "Custom bootloader for roblox.",
                        longDescription: "Get more features and customize the ways that roblox is booted",
                        author: "BloxStraplabs",
                        downloads: 0,
                        icon: "ph-code",
                        tags: ["Roblox"],
                        downloadLink: "downloads/Bloxstrap-v2.10.0.exe",
                        size: "12 MB",
                        isNew: true,
                        requirements: {
                            os: "Windows 10/11",
                            processor: "N/A",
                            ram: "N/A",
                            graphics: "N/A"
                        }
                    },
                    {
                        id: "rbx_script_01",
                        name: "Forge Hub",
                        version: "v4.1",
                        type: "Script",
                        description: "a hub of scripts for 15+ games",
                        longDescription: "Automatically grinds levels in BloxFruits, Pet Simulator, and more. Paste this into your executor.",
                        author: "ScriptGod",
                        isVerified: false,
                        downloads: 4300, 
                        icon: "ph-code",
                        tags: ["Roblox", "Scripts", "Cheats"],
                        downloadLink: "#", 
                        scriptContent: "loadstring(game:HttpGet('https://api.luarmor.net/files/v3/loaders/d5ed1fbd4301b1d18d75153c5b47181d.lua'))()",
                        size: "103B",
                        isNew: true,
                        lastUpdated: "Just now",
                        requirements: { os: "Any", processor: "N/A", ram: "N/A", graphics: "N/A" }
                    }
                ]
            }
        ]
    }
];

export const tickerDataTemplate = ["PizzaBoxer updated Bloxstrap to v2.10", "Zentry System Security Scan Completed", "4,192 active users online", "New scripts added to Roblox Hub"];
