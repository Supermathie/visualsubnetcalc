let subnetMap = {};
let maxNetSize = 0;
let infoColumnCount = 5
$('#btn_go').on('click', function() {
    //subnetMap[$('#network').val()] = {
    //    'netsize': parseInt($('#netsize').val())
    //}
    maxNetSize = parseInt($('#netsize').val())
    subnetMap = {
        '10.0.0.0/16': {
            '10.0.0.0/17': {},
            '10.0.128.0/17': {
                '10.0.128.0/18': {
                    '10.0.128.0/19': {},
                    '10.0.160.0/19': {
                        '10.0.160.0/20': {},
                        '10.0.176.0/20': {
                            '10.0.176.0/21': {
                                '10.0.176.0/22': {
                                    '10.0.176.0/23': {},
                                    '10.0.178.0/23': {}
                                },
                                '10.0.180.0/22': {}
                            },
                            '10.0.184.0/21': {}
                        }
                    }
                },
                '10.0.192.0/18': {
                    '10.0.192.0/19': {},
                    '10.0.224.0/19': {
                        '10.0.224.0/20': {},
                        '10.0.240.0/20': {
                            '10.0.240.0/21': {},
                            '10.0.248.0/21': {
                                '10.0.248.0/22': {},
                                '10.0.252.0/22': {
                                    '10.0.252.0/23': {},
                                    '10.0.254.0/23': {
                                        '10.0.254.0/24': {},
                                        '10.0.255.0/24': {}
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    renderTable();
})

$('#calcbody').on('click', 'td.split', function(event) {
    console.log(event)
})

function renderTable() {
    // TODO: Validation Code
    $('#calcbody').empty();
    let maxDepth = get_dict_max_depth(subnetMap, 0)
    addRowTree(subnetMap, 0, maxDepth)
}

function addRowTree(subnetTree, depth, maxDepth) {
    for (let mapKey in subnetTree) {
        if (Object.keys(subnetTree[mapKey]).length > 0) {
            addRowTree(subnetTree[mapKey], depth + 1, maxDepth)
        } else {
            let subnet_split = mapKey.split('/')
            addRow(subnet_split[0], subnet_split[1], (infoColumnCount + maxDepth - depth), 0)
        }
    }
}

function addRow(network, netSize, colspan, rowspan) {
    // TODO: do some checking here for smaller networks like /32, probably some edge cases to watch for.
    let addressFirst = ip2int(network)
    let addressLast = subnet_last_address(addressFirst, netSize)
    // Will need to adjust this for AWS mode
    let usableFirst = addressFirst + 1
    let usableLast = addressLast - 1
    let hostCount = 1 + usableLast - usableFirst
    let newRow =
        '            <tr id="row_' + network.replace('.', '-') + '_' + netSize + '">\n' +
        '                <td class="row_address">' + network + '/' + netSize + '</td>\n' +
        '                <td class="row_range">' + int2ip(addressFirst) + ' - ' + int2ip(addressLast) + '</td>\n' +
        '                <td class="row_usable">' + int2ip(usableFirst) + ' - ' + int2ip(usableLast) + '</td>\n' +
        '                <td class="row_hosts">' + hostCount + '</td>\n' +
        '                <td class="note"><label><input type="text" class="form-control shadow-none p-0"></label></td>\n' +
        '                <td rowspan="1" colspan="' + colspan + '" class="split rotate"><span>/' + netSize + '</span></td>\n'
    if (netSize < maxNetSize) {
        newRow += '                <td rowspan="14" colspan="1" class="join rotate"><span>/' + (netSize + 1) + '</span></td>\n'
    }
    newRow += '            </tr>';

    $('#calcbody').append(newRow)
    console.log(network)
    console.log(netSize)
}


// Helper Functions
function ip2int(ip) {
    return ip.split('.').reduce(function(ipInt, octet) { return (ipInt<<8) + parseInt(octet, 10)}, 0) >>> 0;
}

function int2ip (ipInt) {
    return ( (ipInt>>>24) +'.' + (ipInt>>16 & 255) +'.' + (ipInt>>8 & 255) +'.' + (ipInt & 255) );
}

function subnet_last_address(subnet, netSize) {
    return subnet + subnet_addresses(netSize) - 1;
}

function subnet_addresses(netSize) {
    return 2**(32-netSize);
}

function get_dict_max_depth(dict, curDepth) {
    let maxDepth = curDepth
    for (let mapKey in dict) {
        let newDepth = get_dict_max_depth(dict[mapKey], curDepth + 1)
        if (newDepth > maxDepth) { maxDepth = newDepth }
    }
    return maxDepth
}
