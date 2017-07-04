/**
 * Вывод в консоль будет таким:
 * Starting...
 * Finishing...
 * Inside of callback 2
 * Inside of callback
 *
  * Второй колбэк выводится после финишинга, т.к. он ( Inside of callback 2) помещается в отдельную очередь колбэков, которая отрабатывает уже после стэка операций
 *
 * AIzaSyCKUyGel7qnc1-zhDMRxo0d1I_7_KE-bEI
 * https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=AIzaSyCKUyGel7qnc1-zhDMRxo0d1I_7_KE-bEI
 */

console.log('Starting...')

setTimeout((e) => {
    console.log('Inside of callback')
}, 1000)

setTimeout((e) => {
    console.log('Inside of callback 2')
}, 0)

console.log('Finishing...')