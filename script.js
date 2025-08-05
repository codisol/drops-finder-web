const INFO_URL = "https://drops.warframestat.us/data/info.json"
const DATA_URL = "https://drops.warframestat.us/data/all.json"

async function init() {
    let information_request, latest_build
    try {
        information_request = await fetch(INFO_URL)
        latest_build = await information_request.json()
    } catch (error) {
        console.error(error)
    }
    document.getElementById("timestamp").innerHTML = new Date(latest_build["timestamp"]).toUTCString();
    document.getElementById("modified").innerHTML = new Date(latest_build["modified"]).toUTCString();
}

async function main() {
    init()
    let data_request
    try {
        data_request = await fetch(DATA_URL)
        all_data = await data_request.json()
    } catch (error) {
        console.error(error);
    }
    document.getElementById("input-text").addEventListener("change", onInputChange)
}

function onInputChange(event) {
    document.getElementById("tables").replaceChildren()
    let item = event.target.value
    if (!item) return
    let results = searchItem(all_data, item)
    createTables(results)
}

function createTables(results) {
    let captions = {
        "missionRewards": "Mission Rewards",
        "relics": "Relics",
        "cetusBountyRewards": "Cetus Bounty Rewards"
    }
    let headers = {
        "missionRewards": ["Place", "Mission", "Game Mode", "Rotation", "Item Name", "Chance"],
        "relics": ["Tier", "Relic Name", "State", "Item Name", "Chance"],
        "cetusBountyRewards": ["Bounty Level", "Rotation", "Item Name", "Chance", "Stage"]
    }
    for (const result in results) {
        if (results[result].length > 0) {
            let table_div = document.createElement("div")
            table_div.classList.add("table-wrapper")
            let table = document.createElement("table")
            table.classList.add("table")
            table.appendChild(createCaption(captions[result]))
            table.appendChild(createHeader(...headers[result]))
            for (const data of results[result]) {table.appendChild(createRows(...data))}    
            table_div.appendChild(table)
            document.getElementById("tables").appendChild(table_div)
        }    
    }    
}    

function createCaption(caption) {
    let new_caption = document.createElement("caption")
    new_caption.classList.add("caption")
    new_caption.appendChild(document.createTextNode(caption))
    return new_caption
}

function createHeader(...args) {
    let row = document.createElement("tr")
    for (const title of args) {
        let column = document.createElement("th")
        column.appendChild(document.createTextNode(title))
        row.appendChild(column)
    }
    return row
}

function createRows(...args) {
    let row = document.createElement("tr")
    for (const data of args) {
        let column = document.createElement("td")
        column.appendChild(document.createTextNode(data))
        if (data.endsWith("%")) {column.classList.add("chance")}
        row.appendChild(column)
    }    
    return row
}

function searchItem(all_data, item) {
    return {
        "missionRewards": searchMissionRewards(all_data["missionRewards"], item),
        "relics": searchRelic(all_data["relics"], item),
        "cetusBountyRewards": searchCetusBountyRewards(all_data["cetusBountyRewards"], item)
    }
}

function searchMissionRewards(mission_rewards, item) {
    let results = [];
    for (const place in mission_rewards) {
        for (const mission in mission_rewards[place]) {
            let game_mode = mission_rewards[place][mission]["gameMode"]
            if (mission_rewards[place][mission]["rewards"].constructor !== Array) {
                for (const rotation in mission_rewards[place][mission]["rewards"]) {
                    for (const reward of mission_rewards[place][mission]["rewards"][rotation]) {
                        if (reward["itemName"].toLowerCase().includes(item.toLowerCase())) {
                            results.push([
                                place,
                                mission,
                                game_mode,
                                rotation,
                                reward["itemName"],
                                Number(reward["chance"]).toFixed(2) + "%"
                            ])    
                        }    
                    }    
                }    
            } else {
                for (const reward of mission_rewards[place][mission]["rewards"]) {
                    if (reward["itemName"].toLowerCase().includes(item.toLowerCase())) {
                        results.push([
                            place,
                            mission,
                            game_mode,
                            "-",
                            reward["itemName"],
                            Number(reward["chance"]).toFixed(2) + "%"
                        ])    
                    }    
                }    
            }    
        }    
    }    
    return results
}    

function searchRelic(relics, item) {
    let results = []
    for (const relic of relics) {
        for (const reward of relic["rewards"]) {
            if (reward["itemName"].toLowerCase().includes(item.toLowerCase())) {
                results.push([
                    relic["tier"],
                    relic["relicName"],
                    relic["state"],
                    reward["itemName"],
                    Number(reward["chance"]).toFixed(2) + "%"
                ])    
            }    
        }    
    }    
    return results
}

function searchCetusBountyRewards(cetus_bounty_rewards, item) {
    let results = []
    for (const bounty of cetus_bounty_rewards) {
        for (const rotation in bounty["rewards"]) {
            for (const reward of bounty["rewards"][rotation]) {
                if (reward["itemName"].toLowerCase().includes(item.toLowerCase())) {
                    results.push([
                        bounty["bountyLevel"],
                        rotation,
                        reward["itemName"],
                        Number(reward["chance"]).toFixed(2) + "%",
                        reward["stage"]
                    ])
                }
            }
        }
    }
    return results
}

main()
