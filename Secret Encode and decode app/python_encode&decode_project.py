# import tkinter module
from tkinter import *
from tkinter import ttk
from tkinter import font

# import other necessary modules
import random
import time
import datetime
import base64

# creating root object
root = Tk()

# defining size of window
root.geometry("1200x700")

# setting up the title of window
root.title("Message Encryption and Decryption")

# Set the background color to light blue
root.configure(background="light blue")

# Check if Calibri font is available, otherwise use a fallback
def get_font(size, weight="normal"):
    if "Calibri" in font.families():
        return ('Calibri', size, weight)
    else:
        return ('Arial', size, weight)  # Fallback font

# Create main frames
Tops = Frame(root, width=1600, relief=SUNKEN, bg="light blue")
Tops.pack(side=TOP, pady=5)

# Main content frame (will contain left and right frames)
main_content = Frame(root, bg="light blue")
main_content.pack(fill=BOTH, expand=True, padx=10, pady=5)

# Left frame for input fields
left_frame = Frame(main_content, width=500, relief=SUNKEN, bg="light blue")
left_frame.pack(side=LEFT, fill=BOTH, expand=True, padx=10, pady=10)

# Right frame for history
right_frame = Frame(main_content, width=500, relief=SUNKEN, bg="light blue")
right_frame.pack(side=RIGHT, fill=BOTH, expand=True, padx=10, pady=10)

# ==============================================
#                 TIME
# ==============================================
localtime = time.asctime(time.localtime(time.time()))

lblInfo = Label(Tops, font=get_font(36, 'bold'),
                text="SECRET MESSAGING",
                fg="black", bg="light blue", bd=5, anchor='w')
lblInfo.grid(row=0, column=0)

lblInfo = Label(Tops, font=get_font(14, 'bold'),
                text=localtime, fg="Steel Blue", bg="light blue",
                bd=5, anchor='w')
lblInfo.grid(row=1, column=0)

rand = StringVar()
Msg = StringVar()
key = StringVar()
mode = StringVar()
Result = StringVar()

# History list to store all operations
history_list = []

# exit function
def qExit():
    root.destroy()

# Function to reset the window
def Reset():
    rand.set("")
    Msg.set("")
    key.set("")
    mode.set("")
    Result.set("")

# Result section (below title in left frame)
result_frame = Frame(left_frame, bg="light blue")
result_frame.pack(fill=X, pady=5)

lblService = Label(result_frame, font=get_font(12, 'bold'),
                text="The Result:", bd=5, anchor="w", bg="light blue")
lblService.grid(row=0, column=0)

txtService = Entry(result_frame, font=get_font(12, 'bold'),
                textvariable=Result, bd=5, insertwidth=4,
                bg="powder blue", justify='right', width=30)
txtService.grid(row=0, column=1, padx=5, pady=5)

# Input fields frame
input_frame = Frame(left_frame, bg="light blue")
input_frame.pack(fill=X, pady=5)

# Labels and input boxes
lblReference = Label(input_frame, font=get_font(12, 'bold'),
                    text="Name:", bd=5, anchor="w", bg="light blue")
lblReference.grid(row=0, column=0, sticky=W, pady=5)

txtReference = Entry(input_frame, font=get_font(12, 'bold'),
                    textvariable=rand, bd=5, insertwidth=4,
                    bg="powder blue", justify='right', width=30)
txtReference.grid(row=0, column=1, padx=5, pady=5)

lblMsg = Label(input_frame, font=get_font(12, 'bold'),
            text="MESSAGE:", bd=5, anchor="w", bg="light blue")
lblMsg.grid(row=1, column=0, sticky=W, pady=5)

txtMsg = Entry(input_frame, font=get_font(12, 'bold'),
            textvariable=Msg, bd=5, insertwidth=4,
            bg="powder blue", justify='right', width=30)
txtMsg.grid(row=1, column=1, padx=5, pady=5)

lblkey = Label(input_frame, font=get_font(12, 'bold'),
            text="KEY:", bd=5, anchor="w", bg="light blue")
lblkey.grid(row=2, column=0, sticky=W, pady=5)

txtkey = Entry(input_frame, font=get_font(12, 'bold'),
            textvariable=key, bd=5, insertwidth=4,
            bg="powder blue", justify='right', width=30)
txtkey.grid(row=2, column=1, padx=5, pady=5)

lblmode = Label(input_frame, font=get_font(12, 'bold'),
            text="MODE(e/d):", bd=5, anchor="w", bg="light blue")
lblmode.grid(row=3, column=0, sticky=W, pady=5)

txtmode = Entry(input_frame, font=get_font(12, 'bold'),
            textvariable=mode, bd=5, insertwidth=4,
            bg="powder blue", justify='right', width=30)
txtmode.grid(row=3, column=1, padx=5, pady=5)

# Button frame
button_frame = Frame(left_frame, bg="light blue")
button_frame.pack(fill=X, pady=10)

# History section on the right
lblHistory = Label(right_frame, font=get_font(14, 'bold'),
                text="History", bd=5, anchor="w", bg="light blue")
lblHistory.pack(pady=5)

# Create Treeview widget for history
history_tree = ttk.Treeview(right_frame, columns=("Name", "Operation", "Message", "Result"), 
                          height=20, show="headings")

# Define columns
history_tree.column("Name", width=80)
history_tree.column("Operation", width=60)
history_tree.column("Message", width=160)
history_tree.column("Result", width=160)

# Add headings
history_tree.heading("Name", text="Name")
history_tree.heading("Operation", text="Operation")
history_tree.heading("Message", text="Message")
history_tree.heading("Result", text="Result")

# Add scrollbar
scrollbar = ttk.Scrollbar(right_frame, orient="vertical", command=history_tree.yview)
history_tree.configure(yscrollcommand=scrollbar.set)
scrollbar.pack(side=RIGHT, fill=Y)
history_tree.pack(fill=BOTH, expand=True)

# Clear History button
btnClearHistory = Button(right_frame, padx=8, pady=4, bd=8,
                      fg="black", font=get_font(10, 'bold'),
                      width=10, text="Clear History", bg="orange",
                      command=lambda: clearHistory())
btnClearHistory.pack(side=BOTTOM, pady=5)

# Function to encode
def encode(key, clear):
    enc = []
    
    for i in range(len(clear)):
        key_c = key[i % len(key)]
        enc_c = chr((ord(clear[i]) +
                    ord(key_c)) % 256)
                    
        enc.append(enc_c)
        
    return base64.urlsafe_b64encode("".join(enc).encode()).decode()

# Function to decode
def decode(key, enc):
    dec = []
    
    enc = base64.urlsafe_b64decode(enc).decode()
    for i in range(len(enc)):
        key_c = key[i % len(key)]
        dec_c = chr((256 + ord(enc[i]) -
                        ord(key_c)) % 256)
                            
        dec.append(dec_c)
    return "".join(dec)

def Ref():
    clear = Msg.get()
    k = key.get()
    m = mode.get()
    name = rand.get()

    operation_type = "Encrypt" if m == 'e' else "Decrypt"
    
    if (m == 'e'):
        result = encode(k, clear)
        Result.set(result)
    else:
        result = decode(k, clear)
        Result.set(result)
    
    # Add to history
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    history_entry = (name, operation_type, clear, result)
    history_list.append(history_entry)
    
    # Insert into treeview
    history_tree.insert("", 0, values=history_entry)

# Function to clear history
def clearHistory():
    history_list.clear()
    for i in history_tree.get_children():
        history_tree.delete(i)

# Show message button
btnTotal = Button(button_frame, padx=8, pady=4, bd=8, fg="black",
                font=get_font(10, 'bold'), width=10,
                text="Show Message", bg="powder blue",
                command=Ref)
btnTotal.grid(row=0, column=0, padx=5, pady=5)

# Reset button
btnReset = Button(button_frame, padx=8, pady=4, bd=8,
                fg="black", font=get_font(10, 'bold'),
                width=10, text="Reset", bg="green",
                command=Reset)
btnReset.grid(row=0, column=1, padx=5, pady=5)

# Exit button
btnExit = Button(button_frame, padx=8, pady=4, bd=8, 
                fg="black", font=get_font(10, 'bold'),
                width=10, text="Exit", bg="red",
                command=qExit)
btnExit.grid(row=0, column=2, padx=5, pady=5)

# Style the treeview
style = ttk.Style()
style.configure("Treeview", font=get_font(9))
style.configure("Treeview.Heading", font=get_font(10, 'bold'))

# keeps window alive
root.mainloop()