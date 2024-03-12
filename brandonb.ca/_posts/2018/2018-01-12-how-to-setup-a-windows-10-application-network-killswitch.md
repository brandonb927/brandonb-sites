---
title: How To Setup A Windows 10 Application Network Killswitch
date: 2018-01-12
---

A more appropriate title for this could be: How to setup Windows 10 firewall rules to kill network traffic to an application when it disconnects from your VPN connection, for whatever reason.

If you're concerned with privacy and you're using a VPN connection on your computer to browse the internet, you're likely wanting to protect your downloading habits from prying eyes among other things. In a previous post I [documented the ultimate automated media setup]({{ site.url }}{% post_url /2017/2017-08-10-ultimate-media-server-setup %}) and covered a bit on setting up a VPN to ensure you're safe from your ISP and other 3rd-party snoopers. In this post I want to show you how to setup an application in Windows 10 to kill network activity _only for that application_ using just the Windows Firewall and some straight-forward inbound/outbound rules.

<!-- break -->

To begin, you'll want to ensure that your main network interface has a "Private" network profile and your VPN network interface has a "Public" network profile. If these profiles don't match what you're seeing in the Network and Sharing Center in Windows, don't worry as this is something you'll be changing. If you can't modify these profiles, you might have to move on and try something else as I have yet to find another solution.

## Setting up the network adapter profiles

Find and open the "Local Security Policy" application by using the search in the start menu. In the left sidebar "Security Settings" list find "Network List Manager Policies" and click on it. In the right side of the window find your regular network interface adapter (it'll be the one that isn't your VPN adapter most likely, and not the one that says "All Networks".) Double-click to open your adapter properties, then go to the "Network Location" tab. Ensure that the Location type is set to "Private" and the User Permissions is set to "User cannot change location". Do this again for your VPN adapter but ensure that the Location type is "Public" instead.

Now you can go about setting up the Windows Firewall rules.

## Setting up the Windows Firewall rules

Find and open the "Windows Firewall" application by using the search in the start menu again. You'll want to delete any rules you have for the application you want to have a killswitch setup for in both "Inbound" and Outbound rule sets. Usually applications setup any networking rules the first time they are run after being installed and they try to make a connection to your network.

Once you've done that, start with setting up a new "Inbound" rule (the properties of the "Outbound" rule will be the exact same.)

Select "Program", then "Next".

On the second page, you'll want to insert the path to your application or find it using the browse button. Once you find and select it, click "Next" again.

On the third page make sure you **check** the "Block the connection" option, then click Next.

On the fourth page, **un-check** the "Public" profile, then click "Next".

On the final page, give it a name (something akin to "Block \<application name\>" is fine) then click "Finish".

Complete the above for the "Outbound" rule following the exact same rule creation steps.

Once both rules have been create, go back to "Inbound" rules and find the rule you created first. Open Properties on that rule by either right-clicking or selecting the rule and selecting Properties in the far right sidebar. From here select the "Scope" tab, in the "Local IP address" area select "These IP Addresses" option, then click Add. Insert your static IP here or you can insert your IP subnet range (192.168.0.0/16, etc) if you're not using a static IP. Once completed, click OK then OK again.

Repeat these firewall rule steps again but for the "Outbound" rule you created.

## Testing the solution

You're almost done! Connect to your VPN server then open the application that you're intending to block network access for. Make the application can perform some network activity such as downloading or accessing remote resources beforehand. You'll notice that when the application is running and the VPN is connected that all is well and everything operates normally. You can test that your setup is correct by disconnecting your VPN in the middle of the application generating network traffic. What you should see is an immediate shutdown of any network activity from the application, or a gradual slowdown over the course of a minute coming to a complete halt eventually.

If all of the above is correct, you're done now! You can feel good knowing that if your VPN connection is interrupted or disconnected for whatever reason, applications you've enabled these rules for will not attempt to connect to the internet until the connection is restored.
