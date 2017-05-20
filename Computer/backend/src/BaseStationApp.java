import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.net.SocketException;

import net.tinyos.message.Message;
import net.tinyos.message.MessageListener;
import net.tinyos.message.MoteIF;
import net.tinyos.packet.BuildSource;
import net.tinyos.packet.PhoenixSource;
import net.tinyos.util.PrintStreamMessenger;

public class BaseStationApp extends Thread implements MessageListener {

	private static ServerSocket server = null;
	private static Socket client = null;
	
	private static BaseStationApp baseStation;
	private static MoteIF moteConnection;
	
	public static PhoenixSource phoenix;
	public static String source; 
	
	public static int version_request_message = 1;
	
	public void startServer() {
		try {
			server = new ServerSocket(9000);	
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	static BaseStationApp getInstance() {
		if (baseStation == null) {
			baseStation = new BaseStationApp();
		}
		return baseStation;
	}
	
	private static MoteIF getMoteInstance() {
		if (moteConnection == null) {
			moteConnection = new MoteIF(phoenix);
		}
		return moteConnection;	
	}
	
	private BaseStationApp() {
		MoteIF mote = getMoteInstance();
		mote.registerListener(new ReplyData(), this);
		mote.registerListener(new ReplyTopo(), this);
	}
	
	@Override
	public void messageReceived(int destAddr, Message msg) {
				
		if (msg instanceof ReplyTopo) {
			ReplyTopo rcv = (ReplyTopo)msg;
			
			//if (rcv.get_seqno() < version_request_message) {
			//	return;
			//}
			    
			System.out.println("Message received:\n" 
					+ "source: " + rcv.get_origem() + "\n"
					+ "type: "   + rcv.amType()     + "\n"
					+ "parent: " + rcv.get_parent() + "\n"
					+ "seq: "    + rcv.get_seqno());
			
			if (client == null || client.isClosed()) {
				return;
			}
			
			PrintWriter out = null;
			
			try {
				out = new PrintWriter( client.getOutputStream() );
			} catch (IOException e) {
				e.printStackTrace();
			}
			
			String jsonMsg = MessageCode.encodeReplyTopoToJson((ReplyTopo)msg);
			out.println( jsonMsg );
            out.flush();
            //out.close();

		}
		
		if (msg instanceof ReplyData) {
			ReplyData rcv = (ReplyData)msg;
			
			//if (rcv.get_seqno() < version_request_message) {
			//	return;
			//}
			
			System.out.println("Message received:\n" 
					+ "source: "     + rcv.get_origem() + "\n"
					+ "type: "       + rcv.amType()     + "\n"
					+ "luminosity: " + rcv.get_data_luminosity() + "\n"
					+ "temperature"  + rcv.get_data_temperature() + "\n"
					+ "seq: "    + rcv.get_seqno());
			
			if (client == null || client.isClosed()) {
				return;
			}
			
			PrintWriter out = null;
			
			try {
				out = new PrintWriter( client.getOutputStream() );
			} catch (IOException e) {
				e.printStackTrace();
			}
			
			String jsonMsg = MessageCode.encodeReplyDataToJson((ReplyData)msg);
			out.println( jsonMsg );
            out.flush();
            //out.close();

		}
		
	}

	public void sendMessageToMote(Message msg){
		if (msg != null){
			try {
				MoteIF mote = getMoteInstance();
				mote.send(MoteIF.TOS_BCAST_ADDR, msg);
			} catch (IOException e) {
				e.printStackTrace();
			}
		} else {
			System.out.println("MoteMsg is null");
		}
	}
	
	public static void usage() {
		System.out.println("usage: BaseStationApp [-comm <source>]");
	}
	
	@Override
    public void run()
    {
        while( true )
        {
            try
            {
                System.out.println( "Listening for a connection" );

                // Call accept() to receive the next connection
                client = server.accept();

                // Pass the socket to the RequestHandler thread for processing
                RequestHandler requestHandler = new RequestHandler( client );
                requestHandler.start();
            }
            catch (IOException e)
            {
                e.printStackTrace();
            }
        }
    }
	
	public static void main(String[] args) throws Exception {
		/*
	    if (args.length == 2) {
	      if (!args[0].equals("-comm")) {
		       usage();
		       System.exit(1);
	      }
	      source = args[1];
	    }
	    */
		
		source = "serial@/dev/ttyUSB1:iris";
		
		if (source == null) {
	      phoenix = BuildSource.makePhoenix(PrintStreamMessenger.err);
	    }
	    else {
	      phoenix = BuildSource.makePhoenix(source, PrintStreamMessenger.err);
	    }
	    
	    //System.out.print(phoenix);
		//------------------------------------------------------------------------	
		//start server
	    
	    BaseStationApp base = new BaseStationApp();
		base.startServer();
		
		System.out.println("Start server in port 9000!");
	    
		BaseStationApp trd = new BaseStationApp();
		trd.start();
	
	}
	
}

class RequestHandler extends Thread
{
    private Socket socket;
    RequestHandler( Socket socket )
    {
        this.socket = socket;
    }

    @Override
    public void run()
    {
        try
        {
            //System.out.println( "Received a connection" );
            BufferedReader in = null;
            String request;
            
            try {
            	in = new BufferedReader( new InputStreamReader( socket.getInputStream() ) );
            	request = in.readLine();
            	
            } catch (SocketException e) {
            	in.close();
                socket.close();
                return;
			}
            	
    		while(request.length() > 0) {	
    			System.out.println(request);
    			if (request.equals("RequestTopo")) {
    				System.out.println("> RequestTopo");
    				RequestTopo rqstMsg = new RequestTopo();
    				rqstMsg.amTypeSet(1);
    				rqstMsg.set_seqno(BaseStationApp.version_request_message++);
    				BaseStationApp.getInstance().sendMessageToMote(rqstMsg);
    			}
    			
    			if (request.equals("RequestData")) {
    				System.out.println("> RequestData");
    				RequestData rqstMsg = new RequestData();
    				rqstMsg.amTypeSet(3);
    				rqstMsg.set_seqno(BaseStationApp.version_request_message++);
    				BaseStationApp.getInstance().sendMessageToMote(rqstMsg);
    			}
    			
    			try {
                	request = in.readLine();
                	
                } catch (SocketException e) {
                	System.out.println("Closed");
                	in.close();
                    socket.close();
                    return;
    			}
    		}
    		
            // Close our connection
            in.close();
            socket.close();

            System.out.println( "Connection closed" );
        }
        catch( Exception e ) {
            e.printStackTrace();
        }
    }
}
