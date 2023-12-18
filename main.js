//joinaa servulle komennolla -johtaja / @johtaja
// Jos tupakka / kalja 0 niin kaatuu koska ei ole statseja
// joinvoice ei toimi, Puuttuu se client login
const Discord = require('discord.js')
const { MessageAttachment } = require('discord.js')
const path = require('path')
require('dotenv').config()
const client = new Discord.Client()
const fs = require('fs')

const userDataFile = 'user_data.json'
const channelId = '490133651275644939'
const quotesChannelId = '372001432603328512'

client.once('ready', () => {
  console.log('Ministeri paikalla')
})

client.on('message', async message => {
  if (message.author.bot) return

  const prefixPelaan = '-pelaan'
  const prefixJäähyä = '-jäähy'
  const prefixProfile = '-profiili'
  const prefixKalja = '-kalja'
  const prefixRooki = '-rööki'
  const prefixLervaus = '-lervaus'
  const prefixApu = '-apu'
  const prefixKuva = '-kuva'
  const prefixVoice = '-johtaja'

  if (message.content.startsWith(prefixPelaan)) {
    handlePelaanCommand(message)
  } else if (message.content.startsWith(prefixJäähyä)) {
    handleJäähyäCommand(message)
  } else if (message.content.startsWith(prefixProfile)) {
    handleProfiiliCommand(message)
  } else if (message.content.startsWith(prefixKalja)) {
    handleKaljaCommand(message)
  } else if (message.content.startsWith(prefixRooki)) {
    handleRöökiCommand(message)
  } else if (message.content.startsWith(prefixLervaus)) {
    handleLervausCommand(message)
  } else if (message.content.startsWith(prefixApu)) {
    handleCommands(message)
  } else if (message.content.startsWith(prefixKuva)) {
    handleKuvaCommand(message)
  } else if (message.content.startsWith(prefixVoice)) {
    await joinVoiceChannel(message)
  }
})

async function handlePelaanCommand (message) {
  // Extract the word after the command
  const commandArgs = message.content.slice('-pelaan'.length).trim().split(' ')
  const gameToPlay = commandArgs.join(' ')

  const userIdsToMention = [
    '282220532718632980',
    '228790729881812992',
    '277547247325937665',
    '254340415900221441',
    '282219768784617493',
    '254679059118686210',
    '282217921860861953'
  ]

  const onlineUsers = []

  for (const userId of userIdsToMention) {
    const user = client.users.cache.get(userId)
    const member = message.guild.members.cache.get(userId)

    if (member && member.presence.status !== 'ofline') {
      onlineUsers.push(`<@${userId}>`)
    }
  }

  const onlineUsersString = onlineUsers.join('\n')

  if (onlineUsersString) {
    const response = `Nonii pojat:\n${onlineUsersString}\nMennääpä pelaamaan ${gameToPlay}.`
    const botMessage = await message.channel.send(response)

    // Add reactions to the bot's message
    await botMessage.react('✅') // :white_check_mark:
    await botMessage.react('❌') // :x:
  } else {
    message.channel.send('Ei ketään online. 😢')
  }
}

function handleJäähyäCommand (message) {
  // Extract the mentioned user
  const mentionedMember = message.mentions.members.first()
  const timeoutDuration = 60000 // 10 seconds

  // Check if the author has the required role (adjust 'YOUR_REQUIRED_ROLE_ID' accordingly)
  const requiredRoleId = '282646242897559562'
  const hasRequiredRole = message.member.roles.cache.has(requiredRoleId)

  if (hasRequiredRole) {
    if (mentionedMember) {
      // Mute the mentioned user
      mentionedMember.voice.setMute(true)

      // Unmute after the timeout duration
      setTimeout(() => {
        mentionedMember.voice.setMute(false)
        message.channel.send(`<@${mentionedMember.id}>, jäähy on päättynyt`)
      }, timeoutDuration)

      // Notify the mentioned user about the mute
      message.channel.send(
        `<@${mentionedMember.id}>, saat 60 sekunttia jäähyä ja olet nyt mykistetty!`
      )
    } else {
      message.channel.send(
        'Et maininnut käyttäjää, jolle haluat antaa jäähyä ja mykistystä.'
      )
    }
  } else {
    message.channel.send('You have no power here työtön klovni.')
  }
}

function handleProfiiliCommand (message) {
  const userId = message.author.id

  // Extract the mentioned user
  const mentionedMember = message.mentions.members.first()

  // Create the profile embed with beers and tobaccos details for the command invoker

  if (mentionedMember) {
    // Load user data for the mentioned user
    const mentionedUserData = loadUserData(mentionedMember.user.id)

    // Create the profile embed with beers and tobaccos details for the mentioned user
    const userProfileEmbed = createProfileEmbed(
      mentionedMember,
      mentionedUserData
    )

    // Send the profile embed to the channel for the mentioned user
    message.channel.send(userProfileEmbed)
  } else {
    message.channel.send(
      'Et maininnut käyttäjää, jonka profiilia haluat näyttää.'
    )
  }
}

function createProfileEmbed (member, userData) {
  // Check if the member's user ID exists in userData
  if (userData[member.user.id]) {
    const userStats = userData[member.user.id]
    let status = ' '
    if (userStats.tobaccos > 5) {
      status = 'Röökiboss'
    } else if (userStats.beers > 5) {
      status = 'Keittokapteeni'
    }
    const profileEmbed = new Discord.MessageEmbed()
      .setColor('#0099ff')
      .setTitle(`${member.user.tag}'s Profile`)
      .addField('Username', member.user.username, true)
      .addField('Beers Consumed 🍺', userStats.beers || 0, true)
      .addField('Tobaccos Smoked 🚬', userStats.tobaccos || 0, true)
      .addField('Status: ', status)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setTimestamp()

    return profileEmbed
  } else {
    // Handle the case where the user ID is not found in userData
    console.error(`User data not found for user ID: ${member.user.id}`)
    return null // or handle it as you see fit
  }
}

function handleKaljaCommand (message) {
  if (message.content.toLowerCase() === '-kalja') {
    const userId = message.author.id

    // Load user data from the file
    const userData = loadUserData()

    // Ensure proper initialization of user data
    userData[userId] = userData[userId] || { beers: 0, tobaccos: 0 }

    // Update the user's beer count
    userData[userId].beers += 1

    // Save the updated user data to the file
    saveUserData(userData)

    message.channel.send(
      `<@${userId}>, olet nauttinut ${userData[userId].beers} kaljaa! 🍺`
    )
  }
}

function handleRöökiCommand (message) {
  if (message.content.toLowerCase() === '-rööki') {
    const userId = message.author.id

    // Load user data from the file
    const userData = loadUserData()

    // Ensure proper initialization of user data
    userData[userId] = userData[userId] || { beers: 0, tobaccos: 0 }

    // Update the user's tobacco count
    userData[userId].tobaccos += 1

    // Save the updated user data to the file
    saveUserData(userData)

    message.channel.send(
      `<@${userId}>, olet polttanut ${userData[userId].tobaccos} tupakkaa! 🚬`
    )
  }
}

function handleLervausCommand (message) {
  if (message.content.toLowerCase() === '-lervaus') {
    const userId = message.author.id

    // Load user data from the file
    const userData = loadUserData()

    // Clear user data for the current user
    userData[userId] = { beers: 0, tobaccos: 0 }

    // Save the updated user data to the file
    saveUserData(userData)

    message.channel.send(
      `<@${userId}>, lervaus suoritettu! Heikko Jarkko:face_vomiting:`
    )
  }
}

function handleCommands (message) {
  if (message.content.toLowerCase() === '-apu') {
    message.channel.send(
      `Komennot:\n-apu\n-pelaan (pelin nimi)\n-rööki\n-kalja\n-lervaus\n-profiili (@username)`
    )
  }
}

// Function to send a photo to a channel
async function sendPhotoToChannel (channel, photoFileName) {
  const imagePath = path.join(__dirname, 'img', photoFileName)
  const attachment = new MessageAttachment(imagePath)

  // Fetch messages from the quotes channel
  const quotesChannel = await client.channels.fetch(quotesChannelId)
  const messages = await quotesChannel.messages.fetch()

  // Filter out non-text messages
  const textMessages = messages.filter(msg => msg.content.trim() !== '')

  // Select a random message
  const randomQuote = textMessages.random().content
  channel.send(attachment)
  channel.send(randomQuote)
}

async function sendRandomPhotoWithMessage (
  channel,
  photoFileName,
  quotesChannelId
) {
  const imagePath = path.join(__dirname, 'img', photoFileName)
  const attachment = new MessageAttachment(imagePath)

  // Fetch messages from the quotes channel
  const quotesChannel = await client.channels.fetch(quotesChannelId)
  const messages = await quotesChannel.messages.fetch()

  // Filter out non-text messages
  const textMessages = messages.filter(msg => msg.content.trim() !== '')

  // Select a random message
  const randomQuote = textMessages.random().content

  // Send the photo and the selected quote
  channel.send(attachment)
  channel.send(`moro\n${randomQuote}`)
}

function getRandomPhotoFileName () {
  const imgPath = path.join(__dirname, 'img')
  const files = fs.readdirSync(imgPath)

  // Filter out non-image files (you can customize this based on your file types)
  const imageFiles = files.filter(
    file => file.endsWith('.jpg') || file.endsWith('.png')
  )

  // Get a random image file
  const randomIndex = Math.floor(Math.random() * imageFiles.length)
  return imageFiles[randomIndex]
}

function handleKuvaCommand (message) {
  const photoFileName = getRandomPhotoFileName()
  sendPhotoToChannel(message.channel, photoFileName)
}

async function joinVoiceChannel (message) {
  // Check if the user is in a voice channel
  const memberVoiceChannel = message.member.voice.channel
  if (!memberVoiceChannel) {
    message.reply('You need to be in a voice channel to use this command.')
    return
  }

  // Join the user's voice channel
  try {
    const connection = await memberVoiceChannel.join()
    message.reply(`Joined ${memberVoiceChannel.name} successfully!`)
  } catch (error) {
    console.error('Error joining voice channel:', error)
    message.reply('Error joining the voice channel.')
  }
}

function loadUserData () {
  try {
    const data = fs.readFileSync(userDataFile)
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading user data:', error)
    return {}
  }
}

function saveUserData (userData) {
  try {
    const data = JSON.stringify(userData, null, 2)
    fs.writeFileSync(userDataFile, data)
  } catch (error) {
    console.error('Error saving user data:', error)
  }
}

// Example of how to use the handleKaljaCommand function

client.login(process.env.BOT_TOKEN)
