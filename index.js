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
const chooseOrderTime = document.getElementById('orderTime')
chooseOrderTime.min = getDate()
chooseOrderTime.value = getDate()

orderTime.addEventListener('change', loadData)
adult.addEventListener('change', loadData)
children.addEventListener('change', loadData)

function loadData () {
  axios.get(`http://localhost:3000/api/order/${restaurantId}?orderTime=${orderTime.value}&adult=${adult.value}&children=${children.value}`)
    .then(function (response) {
      const { availableTime, bookingCounts, condition } = response.data
      let innerHtml = ''
      availableTime.forEach(time => {
        const b = bookingCounts.find(item => item.reserveinfoId === time.id && item.arrangeTable === condition)
        if (!b) {
          innerHtml += `
          <input type="radio" class="btn-check select" name="reservedTime" id="${time.openingTime}" value="${time.openingTime}">
          <label class="btn btn-outline-secondary" for="${time.openingTime}">${time.openingTime}</label>
        `
          return
        }
        if (b && Number(time[condition]) - Number(b.count) <= 0) {
          innerHtml += `
          <input type="radio" class="btn-check select" name="reservedTime" id="${time.openingTime}" value="${time.openingTime}" disabled>
          <label class="btn btn-outline-secondary" for="${time.openingTime}">${time.openingTime}</label>
        `
        } else {
          innerHtml += `
          <input type="radio" class="btn-check select" name="reservedTime" id="${time.openingTime}" value="${time.openingTime}">
          <label class="btn btn-outline-secondary" for="${time.openingTime}">${time.openingTime}</label>
        `
        }
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
      const { availableTime, bookingCounts, condition } = response.data
      let innerHtml = ''
      availableTime.forEach(time => {
        const b = bookingCounts.find(item => item.reserveinfoId === time.id && item.arrangeTable === condition)
        if (!b) {
          innerHtml += `
          <input type="radio" class="btn-check select" name="reservedTime" id="${time.openingTime}" value="${time.openingTime}">
          <label class="btn btn-outline-secondary" for="${time.openingTime}">${time.openingTime}</label>
        `
          return
        }
        if (b && Number(time[condition]) - Number(b.count) <= 0) {
          innerHtml += `
          <input type="radio" class="btn-check select" name="reservedTime" id="${time.openingTime}" value="${time.openingTime}" disabled>
          <label class="btn btn-outline-secondary" for="${time.openingTime}">${time.openingTime}</label>
        `
        } else {
          innerHtml += `
          <input type="radio" class="btn-check select" name="reservedTime" id="${time.openingTime}" value="${time.openingTime}">
          <label class="btn btn-outline-secondary" for="${time.openingTime}">${time.openingTime}</label>
        `
        }
      })
      selectTime.innerHTML = innerHtml
    })
    .catch(function (err) {
      console.log(err)
    })
}

firstData()
