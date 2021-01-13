import Discord from "discord.js";

export class Messenger {
  private client: Discord.Client;

  constructor(job: () => void) {
    const client = new Discord.Client();

    client.once("ready", () => {
      console.log("Client ready! Starting job...");
      job();
    });

    client.on("message", (message) => {
      if (message.content === "!ping") {
        // send back "Pong." to the channel the message was sent in
        message.channel.send("Pong.");
      }
    });

    client.login(process.env.DISCORD_TOKEN);

    this.client = client;
  }

  public sendMessage = (message: string) => {
    const channel: any = this.client.channels.cache.get(process.env.DISCORD_USER_CHANNEL);
    channel.send(message);
  };

  public sendAdminMessage(message: string) {
    const channel: any = this.client.channels.cache.get(process.env.DISCORD_ADMIN_CHANNEL);
    channel.send(message);
  }
}
