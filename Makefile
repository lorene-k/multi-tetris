NODE_MODULES := node_modules

all:		install

install:	$(NODE_MODULES)/.installed

$(NODE_MODULES)/.installed:	package.json package-lock.json
			@npm install
			@touch $@

dev:		install
			$(MAKE) -j2 client server

client:		install
			@npm run client-dev

server:		install
			@npm run srv-dev

test:		install
			@npm test

.PHONY: all dev test client server install