import queryString from 'query-string';
import config from './config';

const get = (url: string, params?: any) => {
  if (params) {
    url += '?' + queryString.stringify(params);
  }
  console.log(url);
  return fetch(url)
    .then(response => response.json());
};

const post = (url: string, body: any) => {
  const options = {
    ...config.header,
    body: JSON.stringify(body),
  };
  return fetch(url, options)
    .then(response => response.json());
};

export default {
  get,
  post,
};
