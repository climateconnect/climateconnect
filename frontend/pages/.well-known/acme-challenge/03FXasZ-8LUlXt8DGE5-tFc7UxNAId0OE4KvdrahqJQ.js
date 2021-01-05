export default function challenge() {
  return process.env.LETS_ENCRYPT_FILE_CONTENT ? process.env.LETS_ENCRYPT_FILE_CONTENT : "";
}