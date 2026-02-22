import requests
import streamlit as st

with st.form("my_form"):
    st.write("Where would you like to see the weather?")
    city = st.text_input("City")
    state = st.text_input("State Code (Abr.)")
    zipcode = st.text_input("Zipcode")
    date = st.text_input("Date (format YYYY-MM-DD)")
    submitted = st.form_submit_button("Submit")

if submitted:
    body = {
        "lat": "",
        "long": "",
        "city": city,
        "state": state,
        "zipcode": zipcode,
        "date": date,
    }

    if date:
        url = "http://localhost:3634/date"
    else:
        url = "http://localhost:3634"

    with st.spinner("Fetching..."):
        response = requests.post(url, json=body)
        data = response.json()

    print(data)

    if date:
        st.write(f"The max temp was {data["temperature"]["max"]} degrees")

    else:
        st.write(f"The temperature is {data['current']['temp']} degrees")
