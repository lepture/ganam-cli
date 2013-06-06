build:
	@node bin/ganam example -v

watch:
	@node bin/ganam example -v -w

pure:
	@node bin/ganam example -v -t pure

clean:
	@rm -fr out

publish: clean build
	@node bin/ganam example -v -t pure -o out/pure
	@ghp-import out -p

.PHONY: build watch pure clean publish
