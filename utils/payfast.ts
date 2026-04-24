import crypto from "crypto";

export function generatePayFastSignature(
  data: Record<string, any>,
  passphrase: string = ""
) {
  const filtered: Record<string, any> = {};

  Object.keys(data).forEach((key) => {
    if (
      data[key] !== "" &&
      data[key] !== null &&
      key !== "signature" &&
      key !== "merchant_key"
    ) {
      filtered[key] = data[key];
    }
  });

  const ordered = Object.keys(filtered)
    .sort()
    .map(
      (key) =>
        `${key}=${encodeURIComponent(filtered[key]).replace(/%20/g, "+")}`
    )
    .join("&");

  const stringToSign = passphrase
    ? `${ordered}&passphrase=${encodeURIComponent(passphrase)}`
    : ordered;

  return crypto.createHash("md5").update(stringToSign).digest("hex");
}