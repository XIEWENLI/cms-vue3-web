import Axios from "../servise/request";
import { baseURL } from "../constant/index.js";

const XWLRequest = new Axios({
  baseURL,
});

export default XWLRequest;
