NODE_MODULES := node_modules
DIST := src/client/dist
COVERAGE := coverage

all:		run

install:	$(NODE_MODULES)/.installed

$(NODE_MODULES)/.installed:	package.json package-lock.json
			@npm install
			@touch $@

build:		install $(DIST)/bundle.js

$(DIST)/bundle.js:
			@npm run client-dist

dev:		install
			$(MAKE) -j2 client server

run:		build
			@npm run srv-dist

client:		install
			@npm run client-dev

server:		install
			@npm run srv-dev

test:		install
			@npm test

coverage:	install
			@npm run coverage

fclean:
			@rm -rf $(NODE_MODULES) $(DIST) $(COVERAGE)

re:			fclean all

.PHONY: all install build dev run client server test coverage re fclean