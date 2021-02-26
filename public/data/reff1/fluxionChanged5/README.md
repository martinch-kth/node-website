<p align="center"><img src="https://github.com/FluxionNetwork/fluxion/blob/master/logos/logo1.jpg?raw=true" /></p>

# Fluxion is the future of MITM WPA attacks
R12=0x00007fede12ec320, R13=0x0000000000000000, R14=0x00007fee2bd2c8e0, R15=0x00007fee2c11e000
RIP=0x00007feea10699fa, EFLAGS=0x0000000000010246, CSGSFS=0x002b000000000033, ERR=0x0000000000000004
  TRAPNO=0x000000000000000e

Top of Stack: (sp=0x00007fee2984a7f8)
0x00007fee2984a7f8:   00007fee2bb08d21 00007fee301d4160
0x00007fee2984a808:   00007fede12ec320 00007fee2984a8d0
0x00007fee2984a818:   00007fee2984a8a0 0000000000000000
0x00007fee2984a828:   00007fee2b5e9500 00007fee301d4160
0x00007fee2984a838:   00007fee2984a860 0000000000000000ally connected to the fake access point"
This is a social engineering attack and it's pointless to drag clients in automatically. The script relies on the fact that a user should be present in order to enter the wireless credentials.

#### "There's no Internet connectivity in the fake access point"
There shouldn't be one. All of the traffic is being sinkholed to the built in captive portal via a fake DNS responder in order to capture the credentials.

#### "Fake sites don't work"
There might be a problem with lighttpd. The experimental version is tested on lighttpd 1.439-1, anything neweer may break functionality. If you have problems, please use the stable version.

#### "Experimental menu is not responsive"
In the experimental version it will automatically check the handshake. I will fix the menu shortly. If you need a GUI, use the stable version (which doesn't automatically control handshakes).

#### "I need to sign in (on Android)"
This is how the script works. The fake captive portal is set up by the script itself to collect the credentials. Don't freak, it's al okay.

#### "The MAC address of the fake access point differs from the original"
The MAC address of the fake access point differs by one octet from the original in order to prevent fluxion deauthenticating clients from itself during the session. 

## Installation
``` wget https://raw.githubusercontent.com/FluxionNetwork/fluxion/master/install/install.sh && bash install.sh ```

## Updates
If you want to submit a feature, do so by labeling your issue as an "enhancement" or submit a PR. I don't have enough time to make daily changes to fluxion, sorry.

## :white_check_mark: Included dependency versions
1. Aircrack : 1:1.2-0~rc4-0parrot0
2. Lighttpd : 1.439-1
3. Hostapd  : 1:2.3-2.3 _If you want to compare this type `dpkg -l | grep "name"`_


A Linux-based operating system. We recommend Kali Linux 2 or Kali 2016.1 rolling. Kali 2 & 2016 support the latest aircrack-ng versions. An external wifi card is recommended.

## :octocat: Credits
1. l3op - contributor
2. dlinkproto - contributor
3. vk496 - developer of linset
4. Derv82 - @Wifite/2
5. Princeofguilty - @webpages
6. Photos f


#
#  SIGSEGV (0xb) at pc=0x00007feea10699fa, pid=5475, tid=0x00007fee2984b700
#
# JRE version: OpenJDK Runtime Environment (8.0_152-b26) (build 1.8.0_152-release-1343-b26)
# Java VM: OpenJDK 64-Bit Server VM (25.152-b26 mixed mode linux-amd64 compressed oops)
# Problematic frame:
# v  ~BufferBlob::jni_fast_GetLongField
#
# Failed to write core dump. Core dumps have been disabled. To enable core dumping, try "ulimit -c unlimited" before starting Java again
#
# If you would like to submit a bug report, please visit:
#   http://bugreport.java.com/bugreport/crash.jsp
# The crash happened outside the Java Virtual Machine in native code.
# See problematic frame for where to report the bug.
#

***Fluxion is intended to be used for legal security purposes only, and you should only use it to protect networks/hosts you own or have permission to test. Any other use is not the responsibility of the developer(s).  Be sure that you understand and are complying with the Fluxion licenses and laws in your area.  In other words, don't be stupid, don't be an asshole, and use this tool responsibly and legally.***
