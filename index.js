const orderTime = document.querySelector('#orderTime')
const restaurantId = document.querySelector('#restaurantId').textContent
const adult = document.querySelector('#adult')
const children = document.querySelector('#children')
const selectTime = document.querySelector('.select-Time')

function getDate () {
  const date = new Date()
  const year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  if (month < 10) { month = '0' + month }
  if (day < 10) { day = '0' + day }
  return year + '-' + month + '-' + day
}

// default date

orderTime.min = getDate()
orderTime.value = getDate()

orderTime.addEventListener('change', loadData)
adult.addEventListener('change', loadData)
children.addEventListener('change', loadData)

function loadData () {
  axios.get(`http://localhost:3000/api/order/${restaurantId}?orderTime=${orderTime.value}&adult=${adult.value}&children=${children.value}`)
    .then(function (response) {
      console.log(response.data)
      const { availableTime, tableCounts } = response.data
      let innerHtml = ''
      availableTime.forEach(time => {
        innerHtml += `
          <input type="radio" class="btn-check select" name="reservedTime" id="${time.time}" value="${time.time}">
          <label class="btn btn-outline-secondary" for="${time.time}">${time.time}</label>
        `
      })
      selectTime.innerHTML = innerHtml
    })
    .catch(function (err) {
      console.log(err)
    })
}

function firstData () {
  axios.get(`http://localhost:3000/api/order/${restaurantId}?orderTime=${getDate()}&adult=1&children=0`)
    .then(function (response) {
      console.log(response.data)
      const { availableTime, tableCounts } = response.data
      let innerHtml = ''
      availableTime.forEach(time => {
        innerHtml += `
          <input type="radio" class="btn-check select" name="reservedTime" id="${time.time}" value="${time.time}">
          <label class="btn btn-outline-secondary" for="${time.time}">${time.time}</label>
        `
      })
      selectTime.innerHTML = innerHtml
    })
    .catch(function (err) {
      console.log(err)
    })
}

firstData()

const pickList = document.querySelector('.reservation')
const reservedButton = document.querySelector('.reserved-now')

pickList.addEventListener('change', function checkValue (event) {
  if (event.target.tagName === 'INPUT' && event.target.checked) {
    reservedButton.disabled = false
  } else {
    reservedButton.disabled = true
  }
})
