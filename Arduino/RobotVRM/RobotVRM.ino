/*  ___   ___  ___  _   _  ___   ___   ____ ___  ____  
 * / _ \ /___)/ _ \| | | |/ _ \ / _ \ / ___) _ \|    \ 
 *| |_| |___ | |_| | |_| | |_| | |_| ( (__| |_| | | | |
 * \___/(___/ \___/ \__  |\___/ \___(_)____)___/|_|_|_|
 *                  (____/    
 * www.osoyoo.com IR remote control smart car
 * Program tutorial: https://osoyoo.com/2019/09/19/osoyoo-model-3-robot-learning-kit-lesson-2-ir-remote-controlled/
 * 
 * Original code by John Yu
 * 
 * Modified by saten (Satoru Fukagawa), 2024-09-27
 * Modifications:
 * - Modified to operate via Bluetooth instead of IR remote
 */

 #include "SoftwareSerial.h"

SoftwareSerial softserial(11, 4); // 2 to ESP_TX, 4 to ESP_RX by default

int buttonState;
#define speedPinR 5    			//  D5  connect MODEL-X ENA (PWM of right wheels)
#define RightDirectPin1  7    //Right Motor direction pin D7 to MODEL-X IN1 
#define RightDirectPin2  8    //Right Motor direction pin D8 to MODEL-X IN2
#define speedPinL 6    			// D6 connect MODEL-X ENB (PWM of left wheels)
#define LeftDirectPin1  9    	//Left Motor direction pin 9 to MODEL-X IN3 
#define LeftDirectPin2  10   	//Left Motor direction pin 10 to MODEL-X IN4 
   //back speed
#define MAX_PACKETSIZE 32    //softserial receive buffer

enum DN
{ 
  GO_ADVANCE, //go forward
  GO_LEFT, //left turn
  GO_RIGHT,//right turn
  GO_BACK,//backward
  STOP_STOP, 
  DEF
}Drive_Num=DEF;

bool stopFlag = true;//set stop flag
bool JogFlag = false;
uint16_t JogTimeCnt = 0;
uint32_t JogTime=0;

char buffUART[MAX_PACKETSIZE];
unsigned int buffUARTIndex = 0;
unsigned long preUARTTick = 0;

/***************motor control***************/
void go_Advance(void)  //Forward
{
  digitalWrite(RightDirectPin1,LOW);
  digitalWrite(RightDirectPin2,HIGH);
  digitalWrite(LeftDirectPin1,LOW);
  digitalWrite(LeftDirectPin2,HIGH);
  analogWrite(speedPinL,100);
  analogWrite(speedPinR,100);
}
void go_Left(int t=0)  //Turn left
{
  digitalWrite(RightDirectPin1,LOW);
  digitalWrite(RightDirectPin2,HIGH);
  digitalWrite(LeftDirectPin1,HIGH);
  digitalWrite(LeftDirectPin2,LOW);
  analogWrite(speedPinL,0);
  analogWrite(speedPinR,100);
  delay(t);
}
void go_Right(int t=0)  //Turn right
{
  digitalWrite(RightDirectPin1,HIGH);
  digitalWrite(RightDirectPin2,LOW);
  digitalWrite(LeftDirectPin1,LOW);
  digitalWrite(LeftDirectPin2,HIGH);
  analogWrite(speedPinL,100);
  analogWrite(speedPinR,0);
  delay(t);
}
void go_Back(int t=0)  //Reverse
{
  digitalWrite(RightDirectPin1,HIGH);
  digitalWrite(RightDirectPin2,LOW);
  digitalWrite(LeftDirectPin1,HIGH);
  digitalWrite(LeftDirectPin2,LOW);
  analogWrite(speedPinL,100);
  analogWrite(speedPinR,100);
  delay(t);
}
void stop_Stop()    //Stop
{
  digitalWrite(RightDirectPin1,LOW);
  digitalWrite(RightDirectPin2,LOW);
  digitalWrite(LeftDirectPin1,LOW);
  digitalWrite(LeftDirectPin2,LOW);
}

/**************car control**************/
void do_Drive_Tick()
{
    switch (Drive_Num) 
    {
      case GO_ADVANCE:go_Advance();JogFlag = true;JogTimeCnt = 1;JogTime=millis();break;//if GO_ADVANCE code is detected, then go advance
      case GO_LEFT: go_Left();JogFlag = true;JogTimeCnt = 1;JogTime=millis();break;//if GO_LEFT code is detected, then turn left
      case GO_RIGHT:  go_Right();JogFlag = true;JogTimeCnt = 1;JogTime=millis();break;//if GO_RIGHT code is detected, then turn right
      case GO_BACK: go_Back();JogFlag = true;JogTimeCnt = 1;JogTime=millis();break;//if GO_BACK code is detected, then backward
      case STOP_STOP: stop_Stop();JogTime = 0;break;//stop
      default:break;
    }
    Drive_Num=DEF;
   //keep current moving mode for  200 millis seconds
    if(millis()-JogTime>=200)
    {
      JogTime=millis();
      if(JogFlag == true) 
      {
        stopFlag = false;
        if(JogTimeCnt <= 0) 
        {
          JogFlag = false; stopFlag = true;
        }
        JogTimeCnt--;
      }
      if(stopFlag == true) 
      {
        JogTimeCnt=0;
        stop_Stop();
      }
    }
}

//WiFi / Bluetooth through the serial control
void do_Uart_Tick()
{
  char Uart_Date=0;
  if(softserial.available()) 
  {
    size_t len = softserial.available();
    uint8_t sbuf[len + 1];
    sbuf[len] = 0x00;
    softserial.readBytes(sbuf, len);
    //parseUartPackage((char*)sbuf);
    memcpy(buffUART + buffUARTIndex, sbuf, len);//ensure that the serial port can read the entire frame of data
    buffUARTIndex += len;
    preUARTTick = millis();
    if(buffUARTIndex >= MAX_PACKETSIZE - 1) 
    {
      buffUARTIndex = MAX_PACKETSIZE - 2;
      preUARTTick = preUARTTick - 200;
    }
  }
  if(buffUARTIndex > 0 && (millis() - preUARTTick >= 100))
  { //data ready
    buffUART[buffUARTIndex] = 0x00;
    Uart_Date=buffUART[0];
    buffUARTIndex = 0;
  }
  switch (Uart_Date)    //serial control instructions
  {
    Serial.print("data=");
    Serial.println(Uart_Date);
    case 'M':
    Drive_Num=GO_ADVANCE;
    break;
    case 'L':  
    Drive_Num=GO_LEFT;
    break;
    case 'R': 
    Drive_Num=GO_RIGHT;
    break;
    case 'B':  
    Drive_Num=GO_BACK;
    break;
    case 'E':
    Drive_Num=STOP_STOP;
    break;
    default:break;
  }
}

void setup()
{
  pinMode(RightDirectPin1, OUTPUT); 
  pinMode(RightDirectPin2, OUTPUT); 
  pinMode(speedPinL, OUTPUT);  
  pinMode(LeftDirectPin1, OUTPUT);
  pinMode(LeftDirectPin2, OUTPUT); 
  pinMode(speedPinR, OUTPUT); 
  stop_Stop();

  softserial.begin(9600);//In order to fit the Bluetooth module's default baud rate, only 9600
   Serial.begin(9600);
  Serial.println("Start:");
}

void loop()
{  
  do_Uart_Tick();
  do_Drive_Tick();
}