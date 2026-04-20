document.getElementById("checkBtn").addEventListener("click", function () {
  const ip = document.getElementById("ipInput").value.trim();
  const prefix = document.getElementById("prefixInput").value.trim();
  const results = document.getElementById("results");

  if (isValidIPv4(ip)) {
    let output = `<p class="result-good">Valid IPv4 Address</p>`;
    output += `<p><strong>IP Version:</strong> IPv4</p>`;

    if (prefix !== "") {
      const prefixNum = Number(prefix);

      if (prefixNum >= 0 && prefixNum <= 32) {
        const subnetMask = prefixToSubnetMask(prefixNum);
        const networkAddress = getNetworkAddress(ip, prefixNum);
        const broadcastAddress = getBroadcastAddress(ip, prefixNum);
        const hostRange = getUsableHostRange(ip, prefixNum);

        output += `<p><strong>Prefix:</strong> /${prefixNum}</p>`;
        output += `<p><strong>Subnet Mask:</strong> ${subnetMask}</p>`;
        output += `<p><strong>Network Address:</strong> ${networkAddress}</p>`;
        output += `<p><strong>Broadcast Address:</strong> ${broadcastAddress}</p>`;
        output += `<p><strong>Usable Host Range:</strong> ${hostRange}</p>`;
      } else {
        output += `<p class="result-bad">Invalid prefix. Use a number from 0 to 32.</p>`;
      }
    }

    results.innerHTML = output;

  } else if (isValidIPv6(ip)) {

    results.innerHTML = `
      <p class="result-good">Valid IPv6 Address</p>
      <p><strong>IP Version:</strong> IPv6</p>
      <p>IPv6 subnet calculation can be added in the next version.</p>
    `;

  } else {

    results.innerHTML = `
      <p class="result-bad">Invalid IP Address</p>
      <p>Please enter a valid IPv4 or IPv6 address.</p>
    `;
  }
});

function isValidIPv4(ip) {
  const parts = ip.split(".");
  if (parts.length !== 4) return false;

  return parts.every(part => {
    if (part === "" || isNaN(part)) return false;
    const num = Number(part);
    return num >= 0 && num <= 255;
  });
}

function isValidIPv6(ip) {
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)|(([0-9a-fA-F]{1,4}:){1,7}:)|(([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4})|(([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2})|(([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3})|(([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4})|(([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5})|([0-9a-fA-F]{1,4}:)((:[0-9a-fA-F]{1,4}){1,6})|(:)((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
  return ipv6Regex.test(ip);
}

function prefixToSubnetMask(prefix) {
  let mask = [];

  for (let i = 0; i < 4; i++) {
    let bits = Math.max(0, Math.min(8, prefix - i * 8));
    mask.push(bits === 0 ? 0 : 256 - Math.pow(2, 8 - bits));
  }

  return mask.join(".");
}

function ipToInt(ip) {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + Number(octet), 0) >>> 0;
}

function intToIp(int) {
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255
  ].join(".");
}

function getNetworkAddress(ip, prefix) {
  const ipInt = ipToInt(ip);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return intToIp(ipInt & mask);
}

function getBroadcastAddress(ip, prefix) {
  const ipInt = ipToInt(ip);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  const broadcast = (ipInt & mask) | (~mask >>> 0);
  return intToIp(broadcast >>> 0);
}

function getUsableHostRange(ip, prefix) {
  if (prefix >= 31) {
    return "No usable host range for this prefix";
  }

  const network = ipToInt(getNetworkAddress(ip, prefix));
  const broadcast = ipToInt(getBroadcastAddress(ip, prefix));

  const firstHost = intToIp(network + 1);
  const lastHost = intToIp(broadcast - 1);

  return `${firstHost} - ${lastHost}`;
}
