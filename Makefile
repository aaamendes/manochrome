package = manochrome
prefix = /usr/local
datarootdir = $(prefix)/share
datadir = $(datarootdir)
mandir = $(datarootdir)/man
man1dir = $(mandir)/man1
man1files = manochrome.1 manopod2html.1
exec_prefix = $(prefix)
bindir = $(exec_prefix)/bin
EXECUTABLES = manopod2html
packagedir = $(datadir)/$(package)
CSSDIR = $(packagedir)/css
JSDIR = $(packagedir)/js
SUBDIRS = $(packagedir) $(CSSDIR) $(JSDIR)
LCSS = ./css
LCSSFILES = $(LCSS)/manochrome_light.css \
	    $(LCSS)/manochrome_dark.css \
	    $(LCSS)/manochrome_monk.css
LJS = ./js
LJSFILES = $(LJS)/manochrome.js \
					 $(LJS)/init.js

all: subdirs lcssfiles ljsfiles executables man1pages
	echo "Installation complete."

.PHONY: man1pages

man1pages:
	for f in doc/man/man1/*; do \
		cp $$f $(man1dir); \
	done

.PHONY: executables $(EXECUTABLES)

executables: $(EXECUTABLES)

$(EXECUTABLES):
	cp $@ $(bindir)

.PHONY: ljsfiles $(LJSFILES)

ljsfiles: $(LJSFILES)

$(LJSFILES):
	cp $@ $(JSDIR)

.PHONY: lcssfiles $(LCSSFILES)

lcssfiles: $(LCSSFILES)

$(LCSSFILES):
	cp $@ $(CSSDIR)

.PHONY: subdirs $(SUBDIRS)

subdirs: $(SUBDIRS)

$(SUBDIRS): 
	mkdir $@

$(CSSDIR): $(packagedir)
$(JSDIR): $(packagedir)

# Uninstall

.PHONY: uninstall

.IGNORE: uninstall

uninstall:
	for f in $(JSDIR)/*; do \
		rm $$f; \
	done
	for f in $(CSSDIR)/*; do \
		rm $$f; \
	done
	rmdir $(CSSDIR)
	rmdir $(JSDIR)
	for f in $(EXECUTABLES); do \
		rm $(bindir)/$$f; \
	done
	for f in $(man1files); do \
		rm $(man1dir)/$$f; \
	done
	rmdir $(packagedir)
	echo "Uninstall complete."
