const rooturl = `${window.location.protocol}//${window.location.host}/api/`;

/**
 * Wrapper for all API GET requests
 * @param { string } api
 * @returns { Promise< object > }
 */
export async function getdata(api) {
  try {
    const url = rooturl + api;

    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      return data;
    } else {
      throw new Error(`Request failed with status: ${response.status}`);
    }
  } catch (error) {
    console.error("Error fetching data:", error.message);
  }
}

/**
 * TODO check result
 * @param { string } api
 * @param { object } data
 * @returns { Promise }
 */
export async function putdata(api, data) {
  const request = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };

  const url = rooturl + api;
  await fetch(url, request);
}

/**
 * PATCH
 * @param { string } api
 * @param { object } data
 * @returns { Promise }
 */

export async function patchdata(api, id, data) {
  const request = {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  };

  const url = `${rooturl}${api}/${id}`;
  const response = await fetch(url, request);

  if (!response.ok) {
    throw new Error(`Request failed with status: ${response.status}`);
  }

  return await response.json();
}