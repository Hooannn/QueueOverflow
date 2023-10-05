export const registerTemplate = (password: string) => `
<html>
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>
            Title | Register account
        </title>
        <style>
            body {
                position: relative;
                height: 100vh;
                margin: 0;
                text-align: center;
            }
            
            .container {
                width: 100%;
                max-width: 700px;
                height: 100%;
                padding: 35px;
                border-radius: 5px;
                background-color: #222831;
                color: #fff;
            }

            .card {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 100%;
                transform: translate(-50%, -50%);
            }

            span {
                color: #ffbe33;
            }

            button {
                padding: 1em 6em;
                border: 0;
                border-radius: 5px;
                background-color: #ffbe33;
                transition: all 0.3s ease-in;
            }

            button:hover {
                background-color: #e69c00;
            }

            .spacing {
                margin-top: 3rem;
            }
        </style>
    </head>

    <body>
        <div class="container">
            <div class="card">
                <h1 style="margin-top: 0"><span>
                  Hello!
                </span></h1>
                <p>
                    We received a request to register your account
                </p>

                <div class="spacing">
                    <p>To complete register your account, enter the password below 👇🏻</p>
                    <p>This password will be expired in 10 minutes.</p>
                </div>

                <div class="spacing">
                    <h2>${password}</h2>
                </div>

                <p class="spacing" style="margin-bottom: 0">
                Thank you for choosing our service, we wish you a great day!
                </p>
            </div>
        </div>
    </body>
</html>
`;
