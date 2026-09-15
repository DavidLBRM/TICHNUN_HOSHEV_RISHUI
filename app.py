import streamlit as st
import google.generativeai as genai
import tempfile
import os

# 1. הגדרות תצוגת העמוד
st.set_page_config(page_title="עוזר תכנון חושב רישוי", page_icon="🏢", layout="wide")

# 2. חיבור ל-API של ג'מיני באופן מאובטח
# את מפתח ה-API יש להגדיר בהגדרות של Streamlit תחת סודות (Secrets)
if "GOOGLE_API_KEY" not in st.secrets:
    st.error("לא נמצא מפתח API. אנא הגדר GOOGLE_API_KEY ב-Secrets של Streamlit.")
    st.stop()

genai.configure(api_key=st.secrets["GOOGLE_API_KEY"])

# 3. הגדרת המודל והוראות המערכת (System Instructions)
system_instruction = """
אתה עוזר וירטואלי של מינהל התכנון.
תפקידך לעבור על הוראות תכנית מתאר, להשוות אותה להנחיות "תכנון חושב רישוי",
ולייעץ לבודק התכניות האם נדרשים תיקונים. ענה בצורה מקצועית, ממוקדת וברורה.
"""

# שימוש במודל 1.5 Pro שמצטיין בניתוח מסמכים מורכבים וטקסטים ארוכים
model = genai.GenerativeModel(
    model_name="gemini-1.5-pro",
    system_instruction=system_instruction
)

# 4. ניהול זיכרון השיחה (Session State)
# מוודאים שיש לנו אובייקט שיחה של ג'מיני שזוכר את ההקשר
if "chat_session" not in st.session_state:
    st.session_state.chat_session = model.start_chat(history=[])

# שומרים את ההודעות כדי שנוכל להציג אותן על המסך
if "messages" not in st.session_state:
    st.session_state.messages = []

# --- בניית ממשק המשתמש ---
st.title("🏢 בוט בדיקת תכנון חושב רישוי")
st.markdown("העלה את מסמך הוראות התכנית (PDF) ובקש מהבוט לבדוק אותו בהתאם לטופס בדיקת תכנון חושב רישוי.")

# תפריט צד להעלאת קבצים
with st.sidebar:
    st.header("העלאת תכנית לבדיקה")
    uploaded_file = st.file_uploader("בחר קובץ (PDF או TXT)", type=["pdf", "txt"])

    # עיבוד הקובץ רק פעם אחת כשהוא מועלה
    if uploaded_file and "file_uploaded" not in st.session_state:
        with st.spinner("קורא ומעבד את המסמך..."):
            # Streamlit שומר קבצים בזיכרון, ג'מיני דורש נתיב לקובץ. 
            # לכן ניצור קובץ זמני, נעלה אותו לג'מיני, ואז נמחק.
            suffix = f".{uploaded_file.name.split('.')[-1]}"
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
                tmp_file.write(uploaded_file.getvalue())
                tmp_file_path = tmp_file.name

            # העלאת הקובץ לשרתי ג'מיני
            gemini_file = genai.upload_file(tmp_file_path)
            
            # אנו שולחים את הקובץ לבוט כחלק מהשיחה כדי שייכנס לזיכרון שלו
            st.session_state.chat_session.send_message(
                [gemini_file, "מצורף מסמך הוראות התכנית. אנא אשר קבלה והמתן לשאלותיי."]
            )
            
            # הוספת הודעת אישור לממשק המשתמש
            st.session_state.messages.append({"role": "assistant", "content": "המסמך התקבל ועובד בהצלחה. כיצד תרצה שאבדוק אותו?"})
            st.session_state.file_uploaded = True
            
            # ניקוי הקובץ הזמני מהמחשב/שרת
            os.remove(tmp_file_path)

# --- תצוגת חלון הצ'אט המרכזי ---
# הדפסת כל היסטוריית ההודעות על המסך
for msg in st.session_state.messages:
    with st.chat_message(msg["role"]):
        st.markdown(msg["content"])

# תיבת ההזנה של המשתמש לשאלות
if prompt := st.chat_input("לדוגמה: האם הוראות החניה תואמות לתקן?"):
    
    # 1. הצגת שאלת המשתמש במסך ושמירתה בזיכרון התצוגה
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # 2. פנייה לג'מיני וקבלת התשובה
    with st.chat_message("assistant"):
        with st.spinner("הבוט בודק..."):
            response = st.session_state.chat_session.send_message(prompt)
            st.markdown(response.text)
    
    # 3. שמירת תשובת הבוט בזיכרון התצוגה
    st.session_state.messages.append({"role": "assistant", "content": response.text})
