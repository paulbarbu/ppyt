install-loop:
	while true ; do cfx xpi ; wget --post-file=ppyt.xpi http://localhost:8888/ ; sleep 5 ; done

install:
	cfx xpi
	if [[ 8 -eq `wget --post-file=ppyt.xpi http://127.0.0.1:8888/` ]]; then exit 0; fi
