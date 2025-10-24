import "./people.js"
import "./form.js"

document.addEventListener( "DOMContentLoaded", () => {
  configurepeopleheaders()
} )

const dayNames = [ "Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat" ]

function configurepeopleheaders() {
  const currentDate = new Date()

  // Calculate the difference in days between the current day and Monday (considering Monday as the first day of the week, where Sunday is 0)
  const dayOfWeek = currentDate.getDay()
  const daysUntilMonday = 0 === dayOfWeek ? 6 : 1 - dayOfWeek

  // Adjust the date to Monday of this week
  currentDate.setDate( currentDate.getDate() + daysUntilMonday )

  const days = document.getElementsByClassName( "days" )
  for( let index = 0; index < days.length; index++ ) {
    days[ index ].querySelectorAll( ".day-1" )[ 0 ].textContent = `${dayNames[ currentDate.getDay() ]} ${currentDate.getDate()}`
    currentDate.setDate( currentDate.getDate() + 1 )
    days[ index ].querySelectorAll( ".day-2" )[ 0 ].textContent = `${dayNames[ currentDate.getDay() ]} ${currentDate.getDate()}`
    currentDate.setDate( currentDate.getDate() + 1 )
    days[ index ].querySelectorAll( ".day-3" )[ 0 ].textContent = `${dayNames[ currentDate.getDay() ]} ${currentDate.getDate()}`
    currentDate.setDate( currentDate.getDate() + 1 )
    days[ index ].querySelectorAll( ".day-4" )[ 0 ].textContent = `${dayNames[ currentDate.getDay() ]} ${currentDate.getDate()}`
    currentDate.setDate( currentDate.getDate() + 1 )
    days[ index ].querySelectorAll( ".day-5" )[ 0 ].textContent = `${dayNames[ currentDate.getDay() ]} ${currentDate.getDate()}`
    currentDate.setDate( currentDate.getDate() + 1 )
    days[ index ].querySelectorAll( ".day-6" )[ 0 ].textContent = `${dayNames[ currentDate.getDay() ]} ${currentDate.getDate()}`
    currentDate.setDate( currentDate.getDate() + 1 )
    days[ index ].querySelectorAll( ".day-7" )[ 0 ].textContent = `${dayNames[ currentDate.getDay() ]} ${currentDate.getDate()}`
  }
}
