import https from 'https';

const url = 'https://ekhquduqyzqsrgommdoh.supabase.co/rest/v1/';
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const options = {
  headers: {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Accept': 'application/json'
  }
};

https.get(url, options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const swagger = JSON.parse(data);
    console.log("Approval Requests properties:", JSON.stringify(swagger.definitions.approval_requests.properties, null, 2));
    console.log("Tool Calls properties:", JSON.stringify(swagger.definitions.tool_calls.properties, null, 2));
  });
}).on('error', err => console.log(err));
