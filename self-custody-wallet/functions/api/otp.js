function hex2buf(input) {
  const view = new Uint8Array(input.length / 2);
  for (let i = 0; i < input.length; i += 2) {
    view[i / 2] = parseInt(input.substring(i, i + 2), 16);
  }
  return view.buffer;
}

function buf2hex(buffer) {
  return [...new Uint8Array(buffer)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

async function sha256(string) {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((bytes) => bytes.toString(16).padStart(2, "0")).join("");
  return hashHex;
}

const dk = `MIIEpAIBAAKCAQEAzu7CUJ+meCx/1REO857y1i/gvqsGa7G+pPNqAiPQDkiLn4tVLVutW0Z/gnFJ3T7JLbCgOYRAGQOg/+pDKb5DAaYh9zH4BbbfmECpKhxOWufoCqhViQDfkLC94jPnvbAiMhBUwKRr4j1tnaVte1Hl7vOT58cNkqtAvK1xdUL2xI5HFD40K2cikG1GwgTEDd578H30Gnc3iIN3ebEUsW18T9txmcj1et2rUpXHvMUGicxUsITnrzLtzEHvm/VxuSjSdOq0owl29Lkus+hSROlOikQi1cKyjeXSlDYweOMipBFb5n1HufKJFiWqJBo2V6tygi98pB9AcD4/vPNJZaTJ/wIDAQABAoIBAC1BoHO7hs/Pg6GYmnmDcL6ROAjbJItXE0fGCJAxPuZwzUB2W4mQ/EfzEh34ItxlR+BbOZ96of4WghaWKFwvxT3OFK2YWxL83MfSlGymRiixgVkbWaGd9EcTsGORUIR2yfPDCJYdH48aOif5LwmCbtQkp1tQeFJ0a7MYB7FKlOeFha8wUM0L0H/Dwtd/VAPFSF8pRuQBsBn0QJ4q2l2BBKcgLaTuTP6b/KKF3cp+n/itboOlq97tzQQa5FQPn78aVWVn1tcgLKEx7cEX5UXYXsEG686yQzmTScuN3WcXzJRQgjpLtrp/qWXErMRoXtN9XAHHq8+HytzmmFh4S+QS1oECgYEA5r89acy3vZvlZzbTso+iayIQfO/dpo+FtRRLUvBsNHh4D4zeoIROlWPhq5l+xMyCNgel9yX1go/OQKSp0iTyRv5XZ5ffB5Bju4IFp7w3xfeMyibYf/WIJk+n9aDw5n0rua+ByZzMNp+sPWiOwJnrsXtVtqQLp5ujRDTJA6lBpb8CgYEA5ZRR5Z59tqiLwYz5h5r3rH3hnSbEbjQxmWptBEeCKXUaUXk+GcqoP06W9JHKRq51MmBsfuT6sQ5WNIxhisaiBcwJFsz95Ps6+ybIPk05H2IfXwNJ04G6HT2dIGkCOe9m1F8ie4UurtBQMTf6o8VtCAoEjrwxxl0ExKTtcx0ga8ECgYAe1Qzqty0SC+OyT/QnluO39vxHBXITkHfoQ0bxVSjQNgys30DcJ/GsKoV7/W2f9Eet2oXFqW/Nu1Nu9dGvP7qT2+Zn9DYb96Ir6urAh/jX3gUU+e3R40gG/nvN6WxnD/CoxhfMjcQHxHwqVG9Gswp4U6eXWQIpqjU9puP5NkOMVwKBgQCxD8huEOOiKbHH8CNPW8yjQ17rJkgfOq/6Q6Oaxk/0C3Xl2l1z5OIIGWPBcmOQSeLnnIhxAcb7ITSJSK++KV4ynF9yL12t6blelFWh/0sMElBhphadQpM5FBkIMxTde+9R4aGlpF0RxGXk3+i1wIFLzvYe47R76afQxebAfnlPwQKBgQC8ABXA+TaXrld6xItkiutKJtCxQRj6USAKaiwj7brttFfvOIbuk5Hvjk3n/nPfkRs4aMBC9eMqJB/LReD8IEGJuu8z6LQUGkTUXk0BsbxaOyBy/wiYaZhphVtBLEJyWwg+Q3dR60Z9DBZOjayQCTgUDr5c7AJXyuZztp7g2urmqw==`;

const sk = { kty: "RSA", key_ops: ["decrypt"], alg: "RSA-OAEP-256", ext: true, d: "NZ8KgJjM1K14-SkGc971TMbrdcrWniKBsNTn8fEsBLPQxm0-ZMaDL0gGbhxQiog1-ZXiao4lOG0JYfNnhPGrMOYgPxMC90_H6DO55-f5shOTN1TpTEByDH1cj0hIn7bjTQZfdsaERqlmjF9wsjVrqfOUvyv-FzFaUQhDWyjhte-IPRVN3eRpCGrm0ZuU0vot9-a6u42w99xOGRfAxhQy_qf0AgPwpis0DdSOGnp2hcQ4v4FyvwDdbQDyTKgxixU-Kff_kVg3A7M8L_vF9-uSk2Zu0IHNaj7kAxNHKs6Ns_GjEw1AY2G6WU-gvB5xBTONh3dWqnkf-tROr6bnv91t0Q", n: "zdtC3NLO0dTORGHzBtgsNG4TWxOL0vfiaubc78afvNCHeq8jSUzLfsfsxuQDCrvKOHk6r8s1xRlLs1nsmaOJFrWAR8pneoPdY3bYsIDfDdxMZ3nDdnsnOqQp_74ipCQYl6qmJSFaMJUzRMHjBafCr6dxZcKf4I9EKdkbDzmGANXh1MP7dZhv2MH10ZMEykyXDF-H2CrNte8gTcfVA0cq3wswfRd-Qfk7eeW2mUG1_D_ixLAZq_JrDrcBNCfsuYWX5DLgzsa_EyEE_6AvIFGI2AuZRINX0luB3NrvQiWNebXjgO3EpGOq-iwZWVw5SxnkqOwFWvaF8TcuZ8niRkQphw", e: "AQAB", p: "_wReGkeL4aKbTTgNQD8SyBfvcOPkZYAbgthjIAD1VIel6QaLR-cNZPIQ4qbrB8ddDVYD_iYcp2Np08-lnfpcleVxGay5DOpstP3nG4FJSsYIIllweLSSoTvYJG5XS1UZZ_r93UJ9Y-ouJCsUWBt4yC63gpzh-lz1V08858qE1C8", q: "zqZir6jVbj4CjyiUiFNlGm3xCEx2Fk7KiwHdbay4yPeKbgTNZ-LNz_Jew44n0T_OoEo2rv0TWOXyLQYOO-wfOgC0Om8AkaIvTEjONP4KOsGxnLHPGtxG13Ood3J_5Ud1En6ZXoSGJBsTFjDyjJkPGOxIe9EsbWhQZM9-0OcDMik", dp: "mfF_BQovrPPGIGU3ypLIubWJO3K2y3b8JI6PuCAb-P0x8Guc5Ljb4xYlj00IEFgPGh_UpTVIktt2ZQCyj501Ct_I2KDlzKAvI0sqmfX_0n2dJ28qcBNBeMdxgPyDAdzLS3O-kDS1EP2rAPZof4-F6AIbkWM3HzXCfQQ-VgZxDM0", dq: "sPQLN230bTVOTbYrEl2PCsWwCzImQE3x5HyRVtP7W6OU90bHeTjekj1x5jS5ZdYkol9KWie9xHcLHIC9-ZPk3W8y5YKd0xc1NzZ01S3gJpYr-AjOVqrfQqj4TmhOmk_JMTAVNrl2gD5q5qq9V6XNJsNWAiiIyZr0lI6Vgl7-_pk", qi: "LpdAUcRg9KFpF6vW7MhXc8VansTDasokjGXDnNvOXSKs_vHKCg04z258t2feDiIysZfGLQ11x8FW_KmtfI2Ue8mNZDQq4mTkeM8WAcUW1jdfbVW3U3zKgvyTKO_GOVkj4bEXb4-srD4UjRfxXlqOTdilQiTBde-Hh1McIWVMw3g" };

const pk = { kty: "RSA", key_ops: ["encrypt"], alg: "RSA-OAEP-256", ext: true, n: "zdtC3NLO0dTORGHzBtgsNG4TWxOL0vfiaubc78afvNCHeq8jSUzLfsfsxuQDCrvKOHk6r8s1xRlLs1nsmaOJFrWAR8pneoPdY3bYsIDfDdxMZ3nDdnsnOqQp_74ipCQYl6qmJSFaMJUzRMHjBafCr6dxZcKf4I9EKdkbDzmGANXh1MP7dZhv2MH10ZMEykyXDF-H2CrNte8gTcfVA0cq3wswfRd-Qfk7eeW2mUG1_D_ixLAZq_JrDrcBNCfsuYWX5DLgzsa_EyEE_6AvIFGI2AuZRINX0luB3NrvQiWNebXjgO3EpGOq-iwZWVw5SxnkqOwFWvaF8TcuZ8niRkQphw", e: "AQAB" };

export async function onRequest({ request, env }) {
  const { searchParams } = new URL(request.url);

  var to_email;
  var code;

  if (searchParams.get("request")) {
    const ciphertext = searchParams.get("request");
    const privateKey = await crypto.subtle.importKey("jwk", sk, { name: "RSA-OAEP", modulusLength: 2048, hash: "SHA-256", publicExponent: new Uint8Array([0x01, 0x00, 0x01]) }, false, ["decrypt"]);
    const decrypted = await crypto.subtle.decrypt({ name: "RSA-OAEP" }, privateKey, hex2buf(ciphertext));
    const json = JSON.parse(new TextDecoder().decode(decrypted));
    to_email = json.email;
    code = json.code;
  } else {
    to_email = searchParams.get("email");
    code = searchParams.get("code");
    const user = await env.DB.get("user#" + to_email);
    if (user !== null) {
      return new Response("User exists", { status: 400 });
    }
  }

  const cs = (await sha256(code)).slice(-2);

  let html = `<!DOCTYPE html><html lang="en"><head><meta http-equiv="Content-Type" content="text/html charset=UTF-8" /></head><body style="font-family: 'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol'"><div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-image: linear-gradient(45deg, #ff0401, #fc6e02);"><div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-image: url(https://mfkdf.com/bg-md.jpg); background-size: cover; background-repeat: no-repeat; background-position: center; opacity: 0.1; width: 100%; height: 100%; z-index: 0;"></div><div style="width: 480px; max-width: 94%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1; text-align: center; margin: 0 auto; padding: 60px 0"><img src="https://wallet-b.mfkdf.com/icon-w.png" alt="MFKDF" style="height: 100px; margin-top: 0; margin-bottom: 2rem;"><div  style="border-radius: 16px; position: relative; background-color: #fff; border: 1px solid rgba(0,0,0,.125); text-align: left; padding: 2rem;"><h3 style="font-size: 1.25rem; margin-top: 0; margin-bottom: 0; font-weight: 500; line-height: 1.2; color: #212529;">Your One-Time Login Code</h3><p style="margin-top: 1rem; margin-bottom: 0; color: #6c757d!important;">Wallet B &middot; wallet-b.mfkdf.com</p><p style="margin-top: 1rem; margin-bottom: 0;">Hello! Here is the one-time login code you requested to access or setup account:</p><h1 style="font-size: 64px; margin: 16px 0; text-align: center; letter-spacing: 4px; font-family: monospace;">${code}</h1><p style="margin-top: 0; margin-bottom: 0;">Please do not share this code with anyone else. We will never call or email you to request this code. If you did not request this code, no further action is necessary.</p></div></div></div></body></html>`;

  let send_request = new Request("https://api.mailchannels.net/tx/v1/send", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [
        {
          to: [{ email: to_email }],
          dkim_domain: "ciao.mfkdf.com",
          dkim_selector: "mailchannels",
          dkim_private_key: dk,
        },
      ],
      from: { email: "otp@ciao.mfkdf.com", name: "Wallet B" },
      subject: "Your One-Time Login Code for Wallet B",
      content: [{ type: "text/html", value: html }],
    }),
  });

  let respContent = "";

  const resp = await fetch(send_request);

  if (resp.status === 202) {
    return new Response(JSON.stringify({ msg: "Sent confirmation email", cs }), { status: 200 });
  } else {
    return new Response("Error sending confirmation email: " + (await resp.text()), { status: 500 });
  }
}
