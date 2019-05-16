FROM node:10-slim

LABEL maintainer="David Boyne <boyney123@>"

WORKDIR /usr/src/performance-budgets

# Install latest chrome dev package.
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-unstable --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && rm -rf /src/*.deb

COPY src /usr/src/performance-budgets/src
COPY package.json /usr/src/performance-budgets

RUN npm install

ENTRYPOINT [ "npm", "start" ]
