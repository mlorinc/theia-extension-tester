FROM fedora

RUN sudo dnf install nodejs java-11-openjdk.x86_64 tigervnc-server
RUN sudo cp /lib/systemd/system/vncserver@.service /etc/systemd/system/vncserver@.service && sudo mkdir /vscode 

USER USER

RUN sudo systemctl enable vncserver.service && sudo systemctl start vncserver.service

ENTRYPOINT [ "/bin/sh" ]